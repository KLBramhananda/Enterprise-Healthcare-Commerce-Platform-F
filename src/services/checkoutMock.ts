/**
 * Mock Checkout Service
 *
 * In-memory mock implementation of ICheckoutService.
 * Provides delivery options, promo validation, prescription checks,
 * and order placement with realistic mock data.
 */

import type { CartItem } from "@/store/cartStore";
import type {
  DeliveryOption,
  AppliedPromo,
  Order,
  OrderItem,
  DeliverySpeed,
  PaymentMethodType,
} from "@/types/checkout";
import type { Product } from "@/types/catalog";
import type { ICheckoutService } from "./checkoutService";

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    speed: "standard",
    label: "Standard Delivery",
    description: "Delivered in 3-5 business days",
    estimatedDays: 4,
    estimatedDate: "Aug 28 - Aug 30",
    charge: 0,
  },
  {
    speed: "express",
    label: "Express Delivery",
    description: "Delivered in 1-2 business days",
    estimatedDays: 2,
    estimatedDate: "Aug 26 - Aug 27",
    charge: 4.99,
  },
  {
    speed: "same_day",
    label: "Same Day Delivery",
    description: "Delivered today by 9 PM",
    estimatedDays: 0,
    estimatedDate: "Today",
    charge: 9.99,
  },
];

const VALID_PROMOS: Record<string, { discountPercent: number; maxDiscount: number; minOrder: number; description: string }> = {
  HEALTH20: { discountPercent: 20, maxDiscount: 15, minOrder: 25, description: "20% off up to $15" },
};

let orderCounter = 1000;
const orderHistory: Map<string, Order> = new Map();

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateOrderId(): string {
  return `ORD-${String(++orderCounter).padStart(6, "0")}`;
}

function calculateTax(subtotal: number): number {
  return Math.round(subtotal * 0.08 * 100) / 100;
}

function getEstimatedDelivery(speed: DeliverySpeed, days: number): string {
  const now = new Date();
  if (speed === "same_day") return now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const target = new Date(now);
  target.setDate(target.getDate() + days);
  return target.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export class MockCheckoutService implements ICheckoutService {
  async getDeliveryOptions(): Promise<DeliveryOption[]> {
    await delay(150);
    return [...DELIVERY_OPTIONS];
  }

  async validatePromoCode(code: string, subtotal: number): Promise<AppliedPromo | null> {
    await delay(250);
    const promo = VALID_PROMOS[code.toUpperCase()];
    if (!promo) return null;
    if (subtotal < promo.minOrder) return null;
    const discountAmount = Math.min(
      Math.round(subtotal * (promo.discountPercent / 100) * 100) / 100,
      promo.maxDiscount,
    );
    return {
      code: code.toUpperCase(),
      discountPercent: promo.discountPercent,
      discountAmount,
    };
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

    const subtotal = params.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const savings = params.items.reduce(
      (sum, item) => sum + (item.product.mrp - item.product.price) * item.quantity,
      0,
    );

    const deliveryOption = DELIVERY_OPTIONS.find((o) => o.speed === params.deliverySpeed);
    const deliveryCharge = deliveryOption?.charge ?? 0;

    const discount = params.appliedPromo?.discountAmount ?? 0;
    const tax = calculateTax(subtotal - discount);
    const grandTotal = Math.round((subtotal - discount + deliveryCharge + tax) * 100) / 100;

    const order: Order = {
      id: generateOrderId(),
      items,
      address: { id: params.addressId } as never, // resolved by caller
      deliverySpeed: params.deliverySpeed,
      deliveryNote: params.deliveryNote,
      prescriptionFiles: [],
      subtotal,
      savings,
      deliveryCharge,
      discount,
      tax,
      grandTotal,
      paymentMethod: params.paymentMethod,
      status: "placed",
      placedAt: new Date().toISOString(),
      estimatedDelivery: getEstimatedDelivery(params.deliverySpeed, deliveryOption?.estimatedDays ?? 4),
    };

    orderHistory.set(order.id, order);
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
}
