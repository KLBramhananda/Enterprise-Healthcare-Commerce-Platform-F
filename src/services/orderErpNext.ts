/**
 * ERPNext Order Service (LIVE_API mode)
 *
 * Implements IOrderService backed entirely by the live KeeMeds Commerce order
 * endpoints (keemeds_commerce.api.orders):
 *   - GET  orders.list                 → the authenticated user's order history
 *   - GET  orders.detail?order_id=     → a single order (scoped to the user)
 *   - GET  orders.invoice?order_id=    → the printable invoice
 *   - GET  orders.tracking?order_id=   → fulfilment timeline events
 *   - POST orders.cancel { reason }    → cancel a Draft/cancellable order
 *
 * The ERP backend is the single source of truth: no locally persisted order
 * record is ever read here, so history survives refresh, logout/login and
 * works cross-device. Reorder recreates the ERP cart by re-adding the order's
 * items through the live cart service.
 *
 * DTO mapping notes:
 *   - The list endpoint is tolerant of both a bare array and a
 *     `{ orders, total }` wrapper.
 *   - Item rows are minimal (item_code/name/brand/image/selling_price), so each
 *     is mapped to a renderable Product straight from the row — matching the
 *     checkout summary mapping; no N+1 product resolution.
 *   - ERPNext Sales Order statuses/dates are normalised into the frontend
 *     OrderStatus set.
 */

import { apiClient } from "@/api/client";
import { ApiError, fromAxiosError } from "@/api/errors";
import { API_ROUTES } from "@/config/api";
import type { Product } from "@/types/catalog";
import type {
  Address,
  Invoice,
  Order,
  OrderItem,
  OrderPaymentStatus,
  OrderStatus,
  OrderTrackingEvent,
  PaymentMethodType,
} from "@/types/checkout";
import type { ErpCheckoutAddressDTO } from "@/types/erpnextCheckout";
import { useCheckoutStore } from "@/store/checkoutStore";
import type {
  ErpCancelResultDTO,
  ErpInvoiceDTO,
  ErpOrderDTO,
  ErpOrderListPayload,
  ErpOrderMessage,
  ErpTrackingDTO,
} from "@/types/erpnextOrder";
import { ServiceError } from "./authService";
import type { ICartService } from "./cartService";
import type { IOrderService } from "./orderService";
import { buildOrderTrackingEvents } from "@/utils/orderTracking";

/** Timeout override preventing order requests from hanging. */
const ORDER_TIMEOUT = 30_000;

/** Fallback address used when the backend omits a shipping address. */
function emptyAddress(id: string): Address {
  return {
    id,
    label: "Shipping Address",
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    isDefault: false,
  };
}

/** Map an ERPNext Address DTO to the storefront Address domain type. */
function toAddress(dto: ErpCheckoutAddressDTO | null | undefined, fallbackId: string): Address {
  if (!dto) return emptyAddress(fallbackId);
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

/** Build a minimal renderable Product straight from an order line. */
function toFallbackProduct(line: {
  itemCode: string;
  name: string;
  brand: string;
  image: string;
  sellingPrice: number;
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
    stockStatus: "in_stock",
    imageUrl: line.image || "",
    isNew: false,
    isBestseller: false,
    isTrending: false,
    isLimitedOffer: false,
  };
}

/** Normalise an ERPNext Sales Order status into the frontend set. */
function mapOrderStatus(status: string | undefined): OrderStatus {
  const s = (status ?? "").toLowerCase();
  if (s === "cancelled" || s === "canceled" || s === "deleted") return "cancelled";
  if (s === "closed" || s === "completed") return "delivered";
  if (s === "draft") return "placed";
  if (s.includes("out for delivery")) return "out_for_delivery";
  if (s.includes("shipped") || s.includes("to deliver") && !s.includes("bill")) return "shipped";
  if (s.includes("packed")) return "packed";
  if (s.includes("on hold")) return "processing";
  if (s.includes("to deliver and bill") || s.includes("to bill")) return "confirmed";
  return "confirmed";
}

/** Normalise an ERP payment method string into the frontend set.
 *  Returns null for unrecognised/empty values instead of guessing, so a
 *  gateway-paid order is never mislabelled as Cash on Delivery. */
function mapPaymentMethod(method?: string | null): PaymentMethodType | null {
  const m = (method ?? "").toLowerCase().trim();
  if (!m) return null;
  if (m === "cod" || m === "cash" || m.includes("cash on delivery")) return "cod";
  if (m === "upi" || m.includes("upi")) return "upi";
  if (
    m === "card" ||
    m.includes("card") ||
    m.includes("credit") ||
    m.includes("debit")
  ) {
    return "card";
  }
  if (m === "net_banking" || m.includes("net banking") || m.includes("netbanking")) return "net_banking";
  if (m === "wallet" || m.includes("wallet")) return "wallet";
  if (m === "emi" || m.includes("emi")) return "emi";
  return null;
}

function mapPaymentStatus(status?: string | null): OrderPaymentStatus {
  return (status ?? "").toLowerCase() === "paid" ? "paid" : "pending";
}

/**
 * Resolve the effective payment method for an ERP order/invoice.
 * The backend stores the real method only on the Payment Session, so the order
 * and invoice DTOs expose it inconsistently. Resolution order:
 *   1. Any explicit ERP field (payment_method / mode_of_payment / instrument).
 *   2. The order this session actually created (checkout store) — it knows the
 *      method the customer picked during checkout.
 *   3. A rule that never fabricates "cod": online-paid orders are shown as UPI,
 *      anything without proof of online payment defaults to COD.
 */
function resolvePaymentMethod(
  erpMethod: PaymentMethodType | null,
  orderId: string,
  paidOnline: boolean,
): PaymentMethodType {
  if (erpMethod) return erpMethod;
  const stored = useCheckoutStore.getState().orders.find((o) => o.id === orderId);
  if (stored?.payment?.method) return stored.payment.method;
  return paidOnline ? "upi" : "cod";
}

function toIsoDate(value?: string | null, fallback?: string): string {
  if (!value) return fallback ?? new Date().toISOString();
  const iso = value.includes("T") ? value : `${value}T00:00:00`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? fallback ?? new Date().toISOString() : parsed.toISOString();
}

function toShortDate(value?: string | null): string {
  if (!value) return "";
  const iso = value.includes("T") ? value : `${value}T00:00:00`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Map a single ERPNext order DTO into the frontend Order domain type. */
function toOrder(dto: ErpOrderDTO): Order {
  const items: OrderItem[] = (Array.isArray(dto.items) ? dto.items : []).map((row) => ({
    product: toFallbackProduct({
      itemCode: row.item_code,
      name: row.item_name,
      brand: row.brand,
      image: row.image,
      sellingPrice: row.selling_price,
    }),
    quantity: Number(row.quantity) || 0,
  }));

  // Resolve the payment method from the available ERP fields. The backend
  // stores the real method only on the Payment Session, so the Sales Order
  // fields may be empty — resolvePaymentMethod falls back to the checkout
  // store record (which knows what the customer picked) and only then to the
  // paid-online/C.O.D. rule, so a gateway-paid order is never shown as COD.
  const paidOnline = mapPaymentStatus(dto.payment_status) === "paid";
  const erpMethod =
    mapPaymentMethod(dto.payment_method) ?? mapPaymentMethod(dto.mode_of_payment);
  const paymentMethod = resolvePaymentMethod(erpMethod, dto.name, paidOnline);
  const paymentStatus = mapPaymentStatus(dto.payment_status);
  // Use the actual ERP transaction/instrument data when available.
  const transactionId = dto.transaction_id;
  const instrumentSummary = dto.instrument_summary;

  return {
    id: dto.name,
    invoiceId: String(dto.invoice_id ?? ""),
    trackingId: String(dto.tracking_id ?? ""),
    items,
    address: toAddress(dto.shipping_address, dto.name),
    deliverySpeed: "standard",
    deliveryNote: "",
    prescriptionFiles: [],
    subtotal: Number(dto.subtotal ?? 0),
    savings: 0,
    deliveryCharge: Number(dto.shipping_charge ?? 0),
    discount: Number(dto.discount ?? 0),
    tax: Number(dto.tax ?? 0),
    platformFee: Number(dto.platform_fee ?? 0),
    grandTotal: Number(dto.grand_total ?? 0),
    paymentMethod,
    payment: {
      method: paymentMethod,
      status: paymentStatus,
      transactionId,
      instrumentSummary,
    },
    status: mapOrderStatus(dto.status),
    placedAt: toIsoDate(dto.creation ?? dto.transaction_date),
    estimatedDelivery: toShortDate(dto.delivery_date),
  };
}

/** Map the tracking DTO into frontend OrderTrackingEvent[]. */
function toTrackingEvents(dto: ErpTrackingDTO): OrderTrackingEvent[] {
  const rows = Array.isArray(dto?.events) ? dto.events : [];
  return rows.map((row) => ({
    type: row.type ?? row.key ?? row.label ?? "",
    label: row.label ?? "",
    description: row.description,
    timestamp: row.timestamp ?? "",
    isCompleted: row.is_completed ?? row.completed,
    isCurrent: row.is_current ?? row.current,
    isCancelled: row.is_cancelled ?? row.cancelled,
  }));
}

/** Map the invoice DTO into the frontend Invoice domain type. */
function toInvoice(dto: ErpInvoiceDTO, orderId: string): Invoice {
  const billingAddress = toAddress(dto.billing_address, orderId);
  const items = (Array.isArray(dto.items) ? dto.items : []).map((row) => ({
    name: String(row.name ?? row.item_code ?? "Item"),
    quantity: Number(row.quantity) || 0,
    unitPrice: Number(row.unit_price ?? row.selling_price ?? 0),
    amount: Math.round(Number(row.amount ?? 0) * 100) / 100,
  }));

  // Resolve payment method flexibly — the ERP invoice endpoint may return
  // strings like "Razorpay UPI", "UPI", "card", etc. Fall back to the checkout
  // store record (which knows what the customer picked) and then to the
  // paid-online/C.O.D. rule. An invoice with a transaction is proof of online
  // payment, so it is never mislabelled as Cash on Delivery.
  const erpMethod =
    mapPaymentMethod(dto.payment_method) ?? mapPaymentMethod(dto.mode_of_payment);
  const effectiveMethod = resolvePaymentMethod(
    erpMethod,
    orderId,
    Boolean(dto.transaction_id),
  );

  return {
    id: String(dto.id ?? dto.invoice_id ?? `INV-${orderId}`),
    orderId: String(dto.order_id ?? orderId),
    issuedAt: toIsoDate(dto.issued_at),
    seller: {
      name: dto.seller?.name ?? "KeeMeds Commerce Pvt. Ltd.",
      address: dto.seller?.address ?? "",
      gstin: dto.seller?.gstin ?? "",
      contact: dto.seller?.contact ?? "",
    },
    billingAddress,
    items,
    subtotal: Number(dto.subtotal ?? 0),
    discount: Number(dto.discount ?? 0),
    deliveryCharge: Number(dto.delivery_charge ?? 0),
    tax: Number(dto.tax ?? 0),
    taxRate: Number(dto.tax_rate ?? 0),
    platformFee: Number(dto.platform_fee ?? 0),
    grandTotal: Number(dto.grand_total ?? 0),
    paymentMethod: effectiveMethod,
    transactionId: dto.transaction_id,
    invoiceNumber: String(dto.invoice_id ?? ""),
    paymentReference: dto.transaction_id,
  };
}

/** A full echoed order DTO (opposed to a bare cancel result object). */
function isOrderDTO(value: unknown): value is ErpOrderDTO {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "items" in value &&
    "grand_total" in value
  );
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
  if (status === 417 || status === 422 || status === 404 || apiErr.category === "validationError") {
    throw new ServiceError(apiErr.message || fallback, "VALIDATION_ERROR", status);
  }
  throw new ServiceError(apiErr.message || fallback, "ORDER_ERROR", status);
}

/** Read + unpack the success_response envelope into the raw data payload. */
async function unpackOrders<T>(
  promise: Promise<{ data: { message: ErpOrderMessage<T> | undefined } }>,
): Promise<T> {
  const response = await promise;
  const message = response.data?.message;
  if (!message || message.success === false) {
    throw new ApiError({ message: "Invalid response from orders API", category: "unknown" });
  }
  return message.data;
}

export class ErpNextOrderService implements IOrderService {
  readonly name = "ErpNextOrderService";

  private readonly cartService: ICartService;

  constructor(cartService: ICartService) {
    this.cartService = cartService;
  }

  async getOrders(): Promise<Order[]> {
    try {
      const payload = await unpackOrders<ErpOrderListPayload>(
        apiClient.get<{ message: ErpOrderMessage<ErpOrderListPayload> }>(
          API_ROUTES.ORDERS.LIST,
          { timeout: ORDER_TIMEOUT },
        ),
      );
      const rows = Array.isArray(payload) ? payload : payload?.orders ?? [];
      return rows.map(toOrder).sort(
        (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
      );
    } catch (error) {
      throw normalizeError(error, "Could not load your order history. Please try again.");
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const dto = await unpackOrders<ErpOrderDTO>(
        apiClient.get<{ message: ErpOrderMessage<ErpOrderDTO> }>(
          API_ROUTES.ORDERS.DETAIL(orderId),
          { timeout: ORDER_TIMEOUT },
        ),
      );
      return dto ? toOrder(dto) : null;
    } catch (error) {
      if (error instanceof ServiceError && error.code === "VALIDATION_ERROR") return null;
      throw normalizeError(error, "Could not load this order. Please try again.");
    }
  }

  async getInvoice(orderId: string): Promise<Invoice | null> {
    try {
      const dto = await unpackOrders<ErpInvoiceDTO>(
        apiClient.get<{ message: ErpOrderMessage<ErpInvoiceDTO> }>(
          API_ROUTES.ORDERS.INVOICE(orderId),
          { timeout: ORDER_TIMEOUT },
        ),
      );
      return dto ? toInvoice(dto, orderId) : null;
    } catch (error) {
      if (error instanceof ServiceError && error.code === "VALIDATION_ERROR") return null;
      throw normalizeError(error, "Could not load the invoice for this order. Please try again.");
    }
  }

  async getTracking(orderId: string): Promise<OrderTrackingEvent[]> {
    try {
      const dto = await unpackOrders<ErpTrackingDTO>(
        apiClient.get<{ message: ErpOrderMessage<ErpTrackingDTO> }>(
          API_ROUTES.ORDERS.TRACKING(orderId),
          { timeout: ORDER_TIMEOUT },
        ),
      );
      const events = toTrackingEvents(dto);
      if (events.length > 0) return events;
      // Backend has no events yet — derive the canonical timeline from the order.
      const order = await this.getOrder(orderId);
      return order ? buildOrderTrackingEvents(order) : [];
    } catch (error) {
      throw normalizeError(error, "Could not load the tracking timeline. Please try again.");
    }
  }

  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    try {
      const payload = await unpackOrders<ErpCancelResultDTO | ErpOrderDTO>(
        apiClient.post<{ message: ErpOrderMessage<ErpCancelResultDTO | ErpOrderDTO> }>(
          API_ROUTES.ORDERS.CANCEL,
          { order_id: orderId, reason },
          { timeout: ORDER_TIMEOUT },
        ),
      );
      // The backend may echo the full cancelled order — map it directly.
      if (isOrderDTO(payload)) {
        return toOrder(payload);
      }
      // Otherwise refetch the order so the returned record reflects the cancel.
      const current = await this.getOrder(orderId);
      if (!current) {
        throw new ServiceError(`Order ${orderId} was not found.`, "ORDER_NOT_FOUND", 404);
      }
      return { ...current, status: "cancelled" };
    } catch (error) {
      throw normalizeError(error, "We couldn't cancel your order. Please try again.");
    }
  }

  async reorder(orderId: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) {
      throw new ServiceError(`Order ${orderId} was not found.`, "ORDER_NOT_FOUND", 404);
    }
    for (const item of order.items) {
      await this.cartService.addItem(item.product.id, item.quantity);
    }
  }
}