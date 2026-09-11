/**
 * OrderTrackingTimeline
 *
 * Renders the fulfilment timeline for a single order. Events are supplied by
 * the caller (usually the ERP tracking service) so the component stays a pure
 * presenter over the canonical Timeline primitive.
 */

import Timeline from "@/components/ui/Timeline";
import type { OrderTrackingEvent } from "@/types/checkout";

export interface OrderTrackingTimelineProps {
  events: OrderTrackingEvent[];
}

export default function OrderTrackingTimeline({ events }: OrderTrackingTimelineProps) {
  return <Timeline events={events} />;
}