/**
 * Mock Checkout Service
 *
 * In-memory mock implementation of ICheckoutService.
 * Provides delivery options, promo validation, prescription checks,
 * and order placement with realistic mock data.
 */

import type { CartItem } from "@/store/cartStore";
import type {
  AppliedPromo,
  Order,
  OrderItem,
  DeliverySpeed,
  PaymentMethodType,
  OrderPaymentInfo,
  Invoice,
  CheckoutSummary,
  CheckoutOrderResult,
} from "@/types/checkout";
import type { Product } from "@/types/catalog";
import {
  DELIVERY_OPTIONS,
  resolveOffer,
} from "@/config/checkout";
import { computeCheckoutTotals } from "@/utils/checkoutCalculations";
import type { ICheckoutService } from "./checkoutService";

let orderCounter = 0;
const orderHistory: Map<string, Order> = new Map();

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateOrderId(): string {
  const year = new Date().getFullYear();
  return `KM${year}${String(++orderCounter).padStart(5, "0")}`;
}

function generateTrackingId(): string {
  const rand = String(Math.floor(100000000 + Math.random() * 900000000));
  return `KMTRK-${rand}`;
}

function getEstimatedDelivery(speed: DeliverySpeed, days: number): string {
  const now = new Date();
  if (speed === "same_day") return now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const target = new Date(now);
  target.setDate(target.getDate() + days);
  return target.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export class MockCheckoutService implements ICheckoutService {
  async getDeliveryOptions() {
    await delay(150);
    return [...DELIVERY_OPTIONS];
  }

  async validatePromoCode(code: string, subtotal: number): Promise<AppliedPromo | null> {
    await delay(250);
    return resolveOffer(code, subtotal);
  }

  async getPrescriptionRequiredProducts(items: CartItem[]): Promise<Product[]> {
    await delay(100);
    return items.filter((item) => item.product.requiresPrescription).map((item) => item.product);
  }

  async placeOrder(params: {
    items: CartItem[];
    addressId: string;
    deliverySpeed: DeliverySpeed;
    deliveryNote: string;
    prescriptionFileIds: string[];
    appliedPromo: AppliedPromo | null;
    paymentMethod: PaymentMethodType;
  }): Promise<Order> {
    await delay(500);

    const items: OrderItem[] = params.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));

    // Totals are derived from the same computeCheckoutTotals source the
    // checkout hook uses, so the recorded Order totals always equal what the
    // Order Summary showed during checkout.
    const totals = computeCheckoutTotals({
      items: params.items,
      appliedPromo: params.appliedPromo,
      deliverySpeed: params.deliverySpeed,
    });

    const deliveryOption = DELIVERY_OPTIONS.find((o) => o.speed === params.deliverySpeed);

    const order: Order = {
      id: generateOrderId(),
      invoiceId: "",
      trackingId: generateTrackingId(),
      items,
      address: { id: params.addressId } as never, // resolved by caller
      deliverySpeed: params.deliverySpeed,
      deliveryNote: params.deliveryNote,
      prescriptionFiles: [],
      appliedPromo: params.appliedPromo,
      subtotal: totals.subtotal,
      savings: totals.savings,
      deliveryCharge: totals.deliveryCharge,
      discount: totals.discount,
      tax: totals.tax,
      platformFee: totals.platformFee,
      grandTotal: totals.grandTotal,
      paymentMethod: params.paymentMethod,
      payment: { method: params.paymentMethod, status: "pending" },
      status: "placed",
      placedAt: new Date().toISOString(),
      estimatedDelivery: getEstimatedDelivery(params.deliverySpeed, deliveryOption?.estimatedDays ?? 4),
    };

    orderHistory.set(order.id, order);
    return order;
  }

  async confirmPayment(orderId: string, payment: OrderPaymentInfo): Promise<Order> {
    await delay(350);
    const order = orderHistory.get(orderId);
    if (!order) throw new Error(`Order ${orderId} was not found.`);
    order.payment = { ...payment };
    order.invoiceId = `INV-${order.id}`;
    if (payment.status === "paid") {
      order.status = "confirmed";
    }
    orderHistory.set(orderId, order);
    return order;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    await delay(150);
    return orderHistory.get(orderId) ?? null;
  }

  async getOrders(): Promise<Order[]> {
    await delay(200);
    return Array.from(orderHistory.values()).sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    );
  }

  async getInvoice(orderId: string): Promise<Invoice | null> {
    await delay(250);
    const order = orderHistory.get(orderId);
    if (!order) return null;

    const taxRate = order.subtotal - order.discount > 0 ? Math.round((order.tax / (order.subtotal - order.discount)) * 100) : 0;

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

  /**
   * The ERP-backed summary/validate/create-order flow only runs under
   * LIVE_API. STATIC keeps the local wizard (placeOrder + local totals), so
   * these methods are intentionally unsupported here.
   */
  private unsupported(): never {
    throw new Error(
      "ERP checkout endpoints are only available in LIVE_API mode (STATIC uses the local checkout wizard).",
    );
  }

  async getCheckoutSummary(): Promise<CheckoutSummary> {
    await delay(50);
    return this.unsupported();
  }

  async validateCheckout(): Promise<CheckoutSummary> {
    await delay(50);
    return this.unsupported();
  }

  async createCheckoutOrder(): Promise<CheckoutOrderResult> {
    await delay(50);
    return this.unsupported();
  }
}
