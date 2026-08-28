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
} from "@/types";

export interface ICheckoutService {
  getDeliveryOptions(): Promise<DeliveryOption[]>;
  validatePromoCode(code: string, subtotal: number): Promise<AppliedPromo | null>;
  getPrescriptionRequiredProducts(items: CartItem[]): Promise<Product[]>;
  placeOrder(params: {
    items: CartItem[];
    addressId: string;
    deliverySpeed: import("@/types/checkout").DeliverySpeed;
    deliveryNote: string;
    prescriptionFileIds: string[];
    appliedPromo: AppliedPromo | null;
    paymentMethod: import("@/types/checkout").PaymentMethodType;
  }): Promise<Order>;
  /**
   * Mark an order's payment as complete (gateway success or COD accepted).
   * Returns the updated order. Throws if the order does not exist.
   */
  confirmPayment(orderId: string, payment: OrderPaymentInfo): Promise<Order>;
  getOrder(orderId: string): Promise<Order | null>;
  getOrders(): Promise<Order[]>;
  /** Build / return the invoicing document for a paid order (mock). */
  getInvoice(orderId: string): Promise<Invoice | null>;
}
