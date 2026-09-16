/**
 * Mock Order Service (STATIC mode)
 *
 * Implements IOrderService from the persisted checkout store — the same
 * authoritative record the local checkout wizard writes into. This keeps the
 * STATIC demo flow behaviour identical to today (orders survive refresh and
 * appear instantly) while giving Order Management a dedicated service layer.
 *
 * All method signatures match the ERP service so swapping modes is a
 * factory-only change.
 */

import { useCheckoutStore } from "@/store/checkoutStore";
import { buildInvoiceFromOrder } from "@/utils/invoice";
import { buildOrderTrackingEvents } from "@/utils/orderTracking";
import type { Invoice, Order, OrderTrackingEvent } from "@/types/checkout";
import type { IOrderService } from "./orderService";

function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockOrderService implements IOrderService {
  readonly name = "MockOrderService";

  async getOrders(): Promise<Order[]> {
    await delay(300);
    return [...useCheckoutStore.getState().orders].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    );
  }

  async getOrder(orderId: string): Promise<Order | null> {
    await delay(200);
    return useCheckoutStore.getState().orders.find((o) => o.id === orderId) ?? null;
  }

  async getInvoice(orderId: string): Promise<Invoice | null> {
    await delay(200);
    const order = await this.getOrder(orderId);
    return order ? buildInvoiceFromOrder(order) : null;
  }

  async getTracking(orderId: string): Promise<OrderTrackingEvent[]> {
    await delay(250);
    const order = await this.getOrder(orderId);
    return order ? buildOrderTrackingEvents(order) : [];
  }

  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    await delay(350);
    if (!reason || !reason.trim()) {
      throw new Error("Please provide a reason before cancelling this order.");
    }
    const store = useCheckoutStore.getState();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) throw new Error(`Order ${orderId} was not found.`);
    const updated: Order = { ...order, status: "cancelled" };
    store.addOrder(updated);
    return updated;
  }

  async reorder(orderId: string): Promise<void> {
    await delay(250);
    const order = await this.getOrder(orderId);
    if (!order) throw new Error(`Order ${orderId} was not found.`);
    // Lazy import avoids the factory → store circular import (the cart store
    // itself imports the service factory).
    const { useCartStore } = await import("@/store/cartStore");
    const cart = useCartStore.getState();
    for (const item of order.items) {
      await cart.addItem(item.product, item.quantity);
    }
  }
}