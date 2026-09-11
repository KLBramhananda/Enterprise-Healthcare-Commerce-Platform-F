/**
 * Order Service contract
 *
 * The single interface the Order Management UI relies on. Under LIVE_API the
 * ERPNext implementation talks to keemeds_commerce.api.orders.* (ERP is the
 * single source of truth); under STATIC the mock implementation answers from
 * the persisted checkout store so the local wizard flow keeps working.
 */

import type { Invoice, Order, OrderTrackingEvent } from "@/types/checkout";

/** React Query cache keys for the ERP order snapshot. */
export const ORDERS_QUERY_KEY = ["orders"] as const;
export const ORDER_DETAIL_QUERY_KEY = (orderId: string) => ["order-detail", orderId] as const;
export const ORDER_TRACKING_QUERY_KEY = (orderId: string) => ["order-tracking", orderId] as const;
export const ORDER_INVOICE_QUERY_KEY = (orderId: string) => ["order-invoice", orderId] as const;

/**
 * Prefix keys for every ERP order cache. Used by the sync provider (and any
 * wholesale wipe/invalidation) so consumers never re-declare the order cache
 * prefixes by hand — the detail/tracking/invoice keys are derived from these.
 */
export const ORDER_QUERY_PREFIX_KEYS = [
  ORDERS_QUERY_KEY,
  ["order-detail"],
  ["order-tracking"],
  ["order-invoice"],
] as const;

export interface IOrderService {
  /**
   * The authenticated user's complete order history, newest first. Only the
   * current user's orders are ever returned (scoped server-side).
   */
  getOrders(): Promise<Order[]>;
  /** A single order owned by the authenticated user, or null when absent. */
  getOrder(orderId: string): Promise<Order | null>;
  /** The printable invoice document for an order. */
  getInvoice(orderId: string): Promise<Invoice | null>;
  /** The fulfilment timeline events for an order, loaded from the backend. */
  getTracking(orderId: string): Promise<OrderTrackingEvent[]>;
  /**
   * Cancel a Draft/cancellable order via the backend API. Returns the updated
   * (cancelled) order so callers can refresh their local cache.
   */
  cancelOrder(orderId: string, reason: string): Promise<Order>;
  /** Recreate the user's cart from an existing order's items. */
  reorder(orderId: string): Promise<void>;
}