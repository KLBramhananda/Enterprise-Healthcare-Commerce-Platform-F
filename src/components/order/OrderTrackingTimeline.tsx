/**
 * OrderTrackingTimeline
 *
 * Enterprise fulfillment timeline for a single order. Derives the canonical
 * five-stage journey (Placed → Preparing → Packed → Shipped → Out for
 * Delivery → Delivered) from the order status.
 */

import Timeline from "@/components/ui/Timeline";
import { buildOrderTrackingEvents } from "@/utils/orderTracking";
import type { Order } from "@/types/checkout";

export interface OrderTrackingTimelineProps {
  order: Order;
}

export default function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  const events = buildOrderTrackingEvents(order);
  return <Timeline events={events} />;
}
