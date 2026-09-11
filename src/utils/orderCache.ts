/**
 * Order cache invalidation utilities
 *
 * The single place an order-related React Query invalidation is performed. It
 * guarantees every cache that can reflect stale ERP order/payment state is
 * refreshed together, using the canonical keys exported by the order/cart
 * services (no duplicated key literals).
 *
 * Affected caches after a payment confirmation (or a cancellation):
 *   - Orders list  ......... ["orders"]                 (OrdersPage, Dashboard
 *                                                        Recent Orders)
 *   - Order detail ......... ["order-detail", orderId]  (Order Detail)
 *   - Order tracking ....... ["order-tracking", orderId] (timeline)
 *   - Order invoice ........ ["order-invoice", orderId]  (invoice)
 *   - Checkout summary ..... ["checkout-summary"]        (stale totals panel)
 *   - Cart ................. ["cart"]                    (header order/cart
 *                                                        badge, mini-cart)
 */

import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { CART_QUERY_KEY } from "@/services/cartService";
import {
  ORDERS_QUERY_KEY,
  ORDER_DETAIL_QUERY_KEY,
  ORDER_INVOICE_QUERY_KEY,
  ORDER_TRACKING_QUERY_KEY,
} from "@/services/orderService";
import { CHECKOUT_SUMMARY_QUERY_KEY } from "@/hooks/checkout/useCheckout";

/**
 * Invalidate + refetch every ERP order-related cache. When `orderId` is given
 * the scoped detail/tracking/invoice keys are refreshed; the shared lists are
 * always refreshed. Uses `refetchType: 'active'` so mounted consumers (Order
 * Detail, Invoice, Dashboard Recent Orders) immediately refetch instead of
 * waiting for the next interaction. Resolves once all invalidations have been
 * issued so callers (e.g. the payment finalize path) can navigate only after
 * the refetch fires.
 */
export async function invalidateOrderCaches(
  queryClient: QueryClient,
  orderId?: string,
): Promise<void> {
  const keys: QueryKey[] = [
    [...ORDERS_QUERY_KEY],
    [...CART_QUERY_KEY],
    [CHECKOUT_SUMMARY_QUERY_KEY],
  ];
  if (orderId) {
    keys.push(
      [...ORDER_DETAIL_QUERY_KEY(orderId)],
      [...ORDER_TRACKING_QUERY_KEY(orderId)],
      [...ORDER_INVOICE_QUERY_KEY(orderId)],
    );
  }
  await Promise.all(
    keys.map((key) =>
      queryClient.invalidateQueries({ queryKey: key, refetchType: "active" }),
    ),
  );
}