/**
 * ERPNext Checkout Service (LIVE_API mode)
 *
 * Implements ICheckoutService backed entirely by the live KeeMeds Commerce
 * checkout endpoints (keemeds_commerce.api.checkout):
 *   - GET  checkout.summary
 *   - POST checkout.validate
 *   - POST checkout.create_order
 *
 * The ERP backend is the single source of truth for order placement: the
 * summary/validate endpoints return the authoritative line items for the
 * user's live cart + addresses, and create_order persists a Draft Sales Order
 * (replaying an identical draft so retries never produce duplicates).
 *
 * Display totals (the Order Summary, Price Details, payment screen and
 * invoice) are derived from the shared computeCheckoutTotals source so every
 * surface agrees:
 *   Grand Total = Item Price + Delivery Charge - Offer Discount + GST/Tax + Platform Fee
 * with GST/Tax kept at 0 and Platform fee defined in `config/checkout`. The
 * selected delivery speed drives the delivery charge and the applied offer is
 * always deducted. Delivery options remain UI config; the backend has no
 * promo-code endpoint, so the demo offer rule drives the coupon UI and the
 * corresponding storefront totals.
 *
 * There is no payment/orders/invoice backend yet, so post-order reads
 * (confirmPayment / getOrder / getOrders / getInvoice) answer from a bounded
 * in-memory cache of the orders this service created. The storefront success
 * flow owns the authoritative persisted order record via the checkout store.
 */

import { apiClient } from "@/api/client";
import { ApiError, fromAxiosError } from "@/api/errors";
import { API_ROUTES } from "@/config/api";
import { DELIVERY_OPTIONS, resolveOffer } from "@/config/checkout";
import { computeCheckoutTotals } from "@/utils/checkoutCalculations";
import type { CartItem } from "@/store/cartStore";
import type { Product } from "@/types/catalog";
import type {
  Address,
  AppliedPromo,
  DeliveryOption,
  DeliverySpeed,
  Invoice,
  Order,
  OrderItem,
  OrderPaymentInfo,
  CheckoutSummary,
  CheckoutOrderResult,
  PaymentMethodType,
} from "@/types/checkout";
import type {
  ErpCheckoutAddressDTO,
  ErpCheckoutItemDTO,
  ErpCheckoutMessage,
  ErpCheckoutOrderDTO,
  ErpCheckoutSummaryDTO,
} from "@/types/erpnextCheckout";
import type { ICheckoutService } from "./checkoutService";
import { ServiceError } from "./authService";

/** Timeout override preventing checkout requests from hanging. */
const CHECKOUT_TIMEOUT = 30_000;

/** Bounded in-memory cache of Draft Sales Order records created this session. */
const MAX_CACHED_ORDERS = 50;

/** Build a minimal renderable Product straight from a checkout line. */
function toFallbackProduct(line: {
  itemCode: string;
  name: string;
  brand: string;
  image: string;
  sellingPrice: number;
  stockStatus: "in_stock" | "out_of_stock";
}): Product {
  const price = Number(line.sellingPrice) || 0;
  return {
    id: line.itemCode,
    slug: line.itemCode,
    name: String(line.name || line.itemCode),
    brandName: String(line.brand || "KeeMeds"),
    manufacturer: String(line.brand || "KeeMeds"),
    categorySlug: "medicines",
    form: "Tablet",
    packSize: "1",
    price,
    mrp: price,
    discountPercent: 0,
    rating: 0,
    reviewCount: 0,
    requiresPrescription: false,
    stockStatus: line.stockStatus,
    imageUrl: line.image || "",
    isNew: false,
    isBestseller: false,
    isTrending: false,
    isLimitedOffer: false,
  };
}

/** Map the checkout address DTO to the storefront Address domain type. */
function toAddress(dto: ErpCheckoutAddressDTO): Address {
  const title = (dto.address_title ?? "").trim() || dto.address_type || "Shipping";
  return {
    id: dto.name,
    label: title,
    fullName: title,
    phone: dto.phone || "",
    line1: dto.address_line1,
    line2: dto.address_line2 || undefined,
    city: dto.city,
    state: dto.state || "",
    pincode: dto.pincode || "",
    country: dto.country,
    isDefault: Boolean(dto.is_shipping_address || dto.is_primary_address),
  };
}

/** Map the summary DTO into the frontend CheckoutSummary domain type. */
function toCheckoutSummary(dto: ErpCheckoutSummaryDTO): CheckoutSummary {
  return {
    currency: dto.currency || "INR",
    items: (Array.isArray(dto.items) ? dto.items : []).map(
      (row: ErpCheckoutItemDTO) => ({
        itemCode: row.item_code,
        name: String(row.item_name || row.item_code),
        brand: String(row.brand || "KeeMeds"),
        image: row.image || "",
        quantity: Number(row.quantity) || 0,
        sellingPrice: Number(row.selling_price) || 0,
        subtotal: Number(row.subtotal) || 0,
        stockStatus: row.stock_status === "out_of_stock" ? "out_of_stock" : "in_stock",
      }),
    ),
    subtotal: Number(dto.subtotal) || 0,
    discount: Number(dto.discount) || 0,
    tax: Number(dto.tax) || 0,
    shippingCharge: Number(dto.shipping_charge) || 0,
    platformFee: 0,
    grandTotal: Number(dto.grand_total) || 0,
    shippingAddress: dto.shipping_address ? toAddress(dto.shipping_address) : null,
    billingAddress: dto.billing_address ? toAddress(dto.billing_address) : null,
  };
}

/** Normalize request failures into ServiceError instances. */
function normalizeError(error: unknown, fallback: string): never {
  if (error instanceof ServiceError) throw error;
  const apiErr = error instanceof ApiError ? error : fromAxiosError(error);
  const status = apiErr.status;

  if (status === 401 || status === 403) {
    throw new ServiceError(
      "Your session has expired. Please sign in again.",
      "SESSION_EXPIRED",
      status,
    );
  }
  // Frappe surfaces validation failures (empty cart, missing address, out of
  // stock, …) as 417/422/404 via ValidationError/DoesNotExist.
  if (status === 417 || status === 422 || status === 404 || apiErr.category === "validationError") {
    throw new ServiceError(apiErr.message || fallback, "VALIDATION_ERROR", status);
  }
  throw new ServiceError(apiErr.message || fallback, "CHECKOUT_ERROR", status);
}

/** Read + unpack the success_response envelope into the data payload. */
async function unpackCheckout<T>(
  promise: Promise<{ data: { message: ErpCheckoutMessage<T> | undefined } }>,
): Promise<T> {
  const response = await promise;
  const message = response.data?.message;
  if (!message || message.success === false) {
    throw new ApiError({ message: "Invalid response from checkout API", category: "unknown" });
  }
  return message.data;
}

function getEstimatedDate(days?: number): string {
  const now = new Date();
  if (days === undefined || days === null) return "";
  if (days === 0) {
    return now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  const target = new Date(now);
  target.setDate(target.getDate() + days);
  return target.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export class ErpNextCheckoutService implements ICheckoutService {
  readonly name = "ErpNextCheckoutService";

  /** Bounded cache of Draft Sales Orders created this session. */
  private readonly _createdOrders = new Map<string, Order>();

  async getDeliveryOptions(): Promise<DeliveryOption[]> {
    return [...DELIVERY_OPTIONS];
  }

  /**
   * The ERP backend has no promo-code endpoint; the summary applies a
   * configured flat discount. The shared demo offer rule still drives the
   * coupon UI, but order totals always come from the validated summary.
   */
  async validatePromoCode(code: string, subtotal: number): Promise<AppliedPromo | null> {
    return resolveOffer(code, subtotal);
  }

  async getPrescriptionRequiredProducts(items: CartItem[]): Promise<Product[]> {
    return items.filter((item) => item.product.requiresPrescription).map((item) => item.product);
  }

  // ------------------------------------------------------------------ #
  // Live ERP endpoints
  // ------------------------------------------------------------------ #

  async getCheckoutSummary(
    shippingAddressName?: string,
    billingAddressName?: string,
  ): Promise<CheckoutSummary> {
    try {
      const dto = await unpackCheckout<ErpCheckoutSummaryDTO>(
        apiClient.get<{ message: ErpCheckoutMessage<ErpCheckoutSummaryDTO> }>(
          API_ROUTES.CHECKOUT.SUMMARY,
          {
            params: { shipping_address_name: shippingAddressName, billing_address_name: billingAddressName },
            timeout: CHECKOUT_TIMEOUT,
          },
        ),
      );
      return toCheckoutSummary(dto);
    } catch (error) {
      throw normalizeError(error, "Could not load your checkout summary. Please try again.");
    }
  }

  async validateCheckout(
    shippingAddressName?: string,
    billingAddressName?: string,
  ): Promise<CheckoutSummary> {
    try {
      const dto = await unpackCheckout<ErpCheckoutSummaryDTO>(
        apiClient.post<{ message: ErpCheckoutMessage<ErpCheckoutSummaryDTO> }>(
          API_ROUTES.CHECKOUT.VALIDATE,
          { shipping_address_name: shippingAddressName, billing_address_name: billingAddressName },
          { timeout: CHECKOUT_TIMEOUT },
        ),
      );
      return toCheckoutSummary(dto);
    } catch (error) {
      throw normalizeError(error, "We couldn't validate your checkout. Please try again.");
    }
  }

  async createCheckoutOrder(input: {
    summary: CheckoutSummary;
    addressId: string;
    deliverySpeed: DeliverySpeed;
    deliveryNote: string;
    paymentMethod: PaymentMethodType;
    appliedPromo?: AppliedPromo | null;
  }): Promise<CheckoutOrderResult> {
    try {
      // Only the address is accepted by the ERP backend (checkout.create_order
      // → shipping_address_name / billing_address_name). The applied promo is
      // NOT sent: the backend applies its own configured flat discount. The
      // storefront derives the displayed Order Summary, Price Details, payment
      // screen and invoice totals from the shared checkout calculations, which
      // use the selected delivery option charge, the applied offer discount,
      // GST/Tax (0) and the platform fee.
      const payload: Record<string, unknown> = {
        shipping_address_name: input.addressId,
      };
      const dto = await unpackCheckout<ErpCheckoutOrderDTO>(
        apiClient.post<{ message: ErpCheckoutMessage<ErpCheckoutOrderDTO> }>(
          API_ROUTES.CHECKOUT.CREATE_ORDER,
          payload,
          { timeout: CHECKOUT_TIMEOUT },
        ),
      );
      const order = this._buildOrder(input.summary, dto, input);
      if (this._createdOrders.size >= MAX_CACHED_ORDERS) {
        const oldest = this._createdOrders.keys().next().value;
        if (oldest) this._createdOrders.delete(oldest);
      }
      this._createdOrders.set(dto.sales_order, order);
      return {
        salesOrder: dto.sales_order,
        status: dto.status,
        docstatus: dto.docstatus,
        grandTotal: Number(dto.grand_total) || 0,
        currency: dto.currency || "INR",
      };
    } catch (error) {
      throw normalizeError(error, "We couldn't place your order. Please try again.");
    }
  }

  /** Legacy path kept ERP-backed for interface completeness. */
  async placeOrder(params: {
    items: CartItem[];
    addressId: string;
    deliverySpeed: DeliverySpeed;
    deliveryNote: string;
    prescriptionFileIds: string[];
    appliedPromo: AppliedPromo | null;
    paymentMethod: PaymentMethodType;
  }): Promise<Order> {
    const summary = await this.getCheckoutSummary(params.addressId);
    const created = await this.createCheckoutOrder({
      summary,
      addressId: params.addressId,
      deliverySpeed: params.deliverySpeed,
      deliveryNote: params.deliveryNote,
      paymentMethod: params.paymentMethod,
      appliedPromo: params.appliedPromo,
    });
    const order = this._createdOrders.get(created.salesOrder);
    if (!order) throw new Error("Your order could not be created. Please try again.");
    return order;
  }

  // ------------------------------------------------------------------ #
  // Post-order reads (no payment/orders backend yet — in-memory cache only)
  // ------------------------------------------------------------------ #

  async confirmPayment(orderId: string, payment: OrderPaymentInfo): Promise<Order> {
    const current = this._createdOrders.get(orderId);
    if (!current) throw new Error(`Order ${orderId} was not found.`);
    const updated: Order = { ...current, payment: { ...payment } };
    if (payment.status === "paid") {
      updated.status = "confirmed";
      updated.invoiceId = `INV-${orderId}`;
    }
    this._createdOrders.set(orderId, updated);
    return updated;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this._createdOrders.get(orderId) ?? null;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this._createdOrders.values()).sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    );
  }

  async getInvoice(orderId: string): Promise<Invoice | null> {
    const order = this._createdOrders.get(orderId);
    if (!order) return null;

    const taxRate =
      order.subtotal - order.discount > 0
        ? Math.round((order.tax / (order.subtotal - order.discount)) * 100)
        : 0;

    return {
      id: order.invoiceId || `INV-${order.id}`,
      orderId: order.id,
      issuedAt: order.payment?.paidAt ?? order.placedAt,
      seller: {
        name: "KeeMeds Commerce Pvt. Ltd.",
        address: "24 Wellness Avenue, Sector 62, Bengaluru, Karnataka 560102, India",
        gstin: "29ABSCK1234F1Z2",
        contact: "support@keemeds.in",
      },
      billingAddress: order.address,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        amount: Math.round(item.product.price * item.quantity * 100) / 100,
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      promoCode: order.appliedPromo?.code,
      deliveryCharge: order.deliveryCharge,
      tax: order.tax,
      taxRate,
      platformFee: order.platformFee,
      grandTotal: order.grandTotal,
      paymentMethod: order.payment?.method ?? order.paymentMethod,
      transactionId: order.payment?.transactionId,
    };
  }

  // ------------------------------------------------------------------ #
  // Helpers
  // ------------------------------------------------------------------ #

  private _buildOrder(
    summary: CheckoutSummary,
    dto: ErpCheckoutOrderDTO,
    input: {
      addressId: string;
      deliverySpeed: DeliverySpeed;
      deliveryNote: string;
      paymentMethod: PaymentMethodType;
      appliedPromo?: AppliedPromo | null;
    },
  ): Order {
    const deliveryOption = DELIVERY_OPTIONS.find((o) => o.speed === input.deliverySpeed);
    const cartItems: CartItem[] = summary.items.map((line) => ({
      product: toFallbackProduct(line),
      quantity: line.quantity,
      addedAt: new Date().toISOString(),
    }));
    const items: OrderItem[] = cartItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));
    // Derive the recorded totals from the shared checkout calculations so the
    // cached order matches the Order Summary exactly.
    const totals = computeCheckoutTotals({
      items: cartItems,
      appliedPromo: input.appliedPromo ?? null,
      deliverySpeed: input.deliverySpeed,
    });
    return {
      id: dto.sales_order,
      invoiceId: "",
      trackingId: "",
      items,
      address:
        summary.shippingAddress ??
        ({ id: input.addressId } as Address),
      deliverySpeed: input.deliverySpeed,
      deliveryNote: input.deliveryNote,
      prescriptionFiles: [],
      appliedPromo: input.appliedPromo ?? null,
      subtotal: totals.subtotal,
      savings: 0,
      deliveryCharge: totals.deliveryCharge,
      discount: totals.discount,
      tax: totals.tax,
      platformFee: totals.platformFee,
      grandTotal: totals.grandTotal,
      paymentMethod: input.paymentMethod,
      payment: { method: input.paymentMethod, status: "pending" },
      status: "placed",
      placedAt: new Date().toISOString(),
      estimatedDelivery: getEstimatedDate(deliveryOption?.estimatedDays),
    };
  }
}