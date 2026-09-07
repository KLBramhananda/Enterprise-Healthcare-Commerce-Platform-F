/**
 * Checkout Service Interface
 *
 * Defines the contract for delivery options, promo validation,
 * prescription checks, and order placement.
 * UI depends ONLY on this interface.
 */

import type { CartItem } from "@/store/cartStore";
import type {
  DeliveryOption,
  AppliedPromo,
  Order,
  OrderPaymentInfo,
  Product,
  Invoice,
  CheckoutSummary,
  CheckoutOrderResult,
  DeliverySpeed,
  PaymentMethodType,
} from "@/types";

export interface ICheckoutService {
  getDeliveryOptions(): Promise<DeliveryOption[]>;
  validatePromoCode(code: string, subtotal: number): Promise<AppliedPromo | null>;
  getPrescriptionRequiredProducts(items: CartItem[]): Promise<Product[]>;
  placeOrder(params: {
    items: CartItem[];
    addressId: string;
    deliverySpeed: DeliverySpeed;
    deliveryNote: string;
    prescriptionFileIds: string[];
    appliedPromo: AppliedPromo | null;
    paymentMethod: PaymentMethodType;
  }): Promise<Order>;
  /**
   * Mark an order's payment as complete (gateway success or COD accepted).
   * Returns the updated order. Throws if the order does not exist.
   */
  confirmPayment(orderId: string, payment: OrderPaymentInfo): Promise<Order>;
  getOrder(orderId: string): Promise<Order | null>;
  getOrders(): Promise<Order[]>;
  /** Build a printable invoice document for a placed order. */
  getInvoice(orderId: string): Promise<Invoice | null>;
  /**
   * Fetch the authoritative, validated order preview for the current cart from
   * the ERP backend (`checkout.summary`). Only used in LIVE_API mode; the mock
   * implementation throws for these methods (STATIC keeps the local wizard).
   */
  getCheckoutSummary(
    shippingAddressName?: string,
    billingAddressName?: string,
  ): Promise<CheckoutSummary>;
  /**
   * Validate the current cart + addresses via the ERP backend
   * (`checkout.validate`). Returns the same validated summary.
   */
  validateCheckout(
    shippingAddressName?: string,
    billingAddressName?: string,
  ): Promise<CheckoutSummary>;
  /**
   * Create a Draft Sales Order for the validated checkout (`checkout.create_order`,
   * POST). The backend replays an identical pending draft instead of creating a
   * duplicate, so repeated calls with the same content return the same order.
   */
  createCheckoutOrder(input: {
    summary: CheckoutSummary;
    addressId: string;
    deliverySpeed: DeliverySpeed;
    deliveryNote: string;
    paymentMethod: PaymentMethodType;
  }): Promise<CheckoutOrderResult>;
}
