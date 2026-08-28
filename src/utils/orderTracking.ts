/**
 * Order tracking timeline
 *
 * Enterprise-grade fulfillment stages shared by order detail and any
 * compact tracking widget. Every OrderStatus maps onto one of these
 * canonical stages so the UI never has to know about order semantics.
 */

import type { TimelineEvent } from "@/components/ui/Timeline";
import type { Order, OrderStatus } from "@/types/checkout";

export const ORDER_TRACKING_STEPS: Array<{
  key: string;
  label: string;
  description: string;
}> = [
  { key: "placed", label: "Order Placed", description: "We've received your order." },
  { key: "preparing", label: "Preparing Order", description: "Our pharmacists are picking & checking your items." },
  { key: "packed", label: "Packed", description: "Your order has been packed and labeled." },
  { key: "shipped", label: "Shipped", description: "Handed over to our delivery partner." },
  { key: "out_for_delivery", label: "Out for Delivery", description: "Your order is on the final mile." },
  { key: "delivered", label: "Delivered", description: "Your order has been delivered." },
];

/** Rank of each OrderStatus into ORDER_TRACKING_STEPS (index). */
export const ORDER_STATUS_RANK: Record<OrderStatus, number> = {
  placed: 0,
  confirmed: 0,
  processing: 1,
  packed: 2,
  shipped: 3,
  out_for_delivery: 4,
  delivered: 5,
  cancelled: -1,
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function stepTimestamp(order: Order, index: number): string {
  if (index === 0) return order.placedAt;
  const placed = new Date(order.placedAt).getTime();
  const now = Date.now();
  const span = Math.max(now - placed, 60_000);
  return new Date(placed + (span * index) / ORDER_TRACKING_STEPS.length).toISOString();
}

export function buildOrderTrackingEvents(order: Order): TimelineEvent[] {
  if (order.status === "cancelled") {
    return [
      {
        type: "placed",
        label: "Order Placed",
        timestamp: order.placedAt,
        description: "We received your order before it was cancelled.",
        isCompleted: true,
      },
      {
        type: "cancelled",
        label: "Cancelled",
        timestamp: new Date().toISOString(),
        description: "This order was cancelled and is no longer active.",
        isCurrent: true,
        isCancelled: true,
      },
    ];
  }

  const rank = Math.min(
    Math.max(ORDER_STATUS_RANK[order.status], 0),
    ORDER_TRACKING_STEPS.length - 1,
  );

  return ORDER_TRACKING_STEPS.map((step, index) => ({
    type: step.key,
    label: step.label,
    description: step.description,
    timestamp: index <= rank ? stepTimestamp(order, index) : "",
    isCompleted: index < rank,
    isCurrent: index === rank,
  }));
}