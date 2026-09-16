/**
 * useOrders
 *
 * React Query hooks for Order Management backed by the ERP order service
 * (keemeds_commerce.api.orders — the single source of truth for order history,
 * detail, invoice and tracking). The hooks mirror the checkout/cart query
 * conventions used across the app:
 *
 *   - useOrders          → the authenticated user's history (newest first)
 *   - useOrderDetail     → a single order scoped to the user
 *   - useOrderTracking   → fulfilment timeline events
 *   - useOrderInvoice    → printable invoice, with a persisted-checkout-store
 *                          fallback so success/confirmation screens keep
 *                          working even when the backend has no invoice yet
 *   - useCancelOrder     → cancel a Draft/cancellable order; refreshes the
 *                          order list, detail and any derived caches
 *   - useReorderOrder    → recreate the cart from an order; refreshes the ERP
 *                          cart snapshot so the header badge updates
 *
 * STATIC mode answers from the checkout store via MockOrderService, keeping
 * the local demo flow identical. LIVE_API mode reads only the ERP endpoints —
 * no locally persisted history is used.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { CART_QUERY_KEY } from "@/services/cartService";
import { services } from "@/services/factory";
import {
  ORDERS_QUERY_KEY,
  ORDER_DETAIL_QUERY_KEY,
  ORDER_INVOICE_QUERY_KEY,
  ORDER_TRACKING_QUERY_KEY,
} from "@/services/orderService";
import { useInvoice } from "@/hooks/checkout/useInvoice";
import { downloadInvoiceAsHtml, enrichInvoiceFromOrder } from "@/utils/invoice";

const orderService = services.orders;

/** The authenticated user's complete order history (newest first, defensive). */
export function useOrders() {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => orderService.getOrders(),
    select: (orders) => {
      if (!Array.isArray(orders)) return orders;
      // The backend already sorts newest-first; re-apply defensively so every
      // consumer (Orders page, Dashboard, widgets) sees a consistent order
      // regardless of future backend changes.
      return [...orders].sort(
        (a, b) =>
          new Date(b.placedAt ?? 0).getTime() - new Date(a.placedAt ?? 0).getTime(),
      );
    },
  });
}

/** A single order (ERP-scoped to the current user). */
export function useOrderDetail(orderId?: string) {
  return useQuery({
    queryKey: ORDER_DETAIL_QUERY_KEY(orderId ?? "missing"),
    queryFn: () => orderService.getOrder(orderId as string),
    enabled: Boolean(orderId),
  });
}

/** The fulfilment timeline events for an order. */
export function useOrderTracking(orderId?: string) {
  return useQuery({
    queryKey: ORDER_TRACKING_QUERY_KEY(orderId ?? "missing"),
    queryFn: () => orderService.getTracking(orderId as string),
    enabled: Boolean(orderId),
  });
}

/**
 * Printable invoice for an order, ERP-first with a persisted-store fallback so
 * both the confirmation screen (store-backed) and the order detail page
 * (ERP-backed) render the same document.
 */
export function useOrderInvoice(orderId?: string) {
  const storeFallback = useInvoice(orderId);
  const query = useQuery({
    queryKey: ORDER_INVOICE_QUERY_KEY(orderId ?? "missing"),
    queryFn: () => orderService.getInvoice(orderId as string),
    enabled: Boolean(orderId),
  });
  const orderDetail = useOrderDetail(orderId);

  // Enrich the ERP invoice with authoritative order-level fields (shipping
  // address, payment status, order date, customer, payment reference) so the
  // downloadable document carries real data, not placeholders.
  const invoice = useMemo(() => {
    // Prefer the invoice derived from the persisted checkout-store order: it
    // carries the exact amounts the shopper saw and paid at checkout
    // (Grand Total = Item Price + Delivery Charge - Offer Discount + GST/Tax +
    // Platform Fee, with GST/Tax = 0), including the selected delivery option
    // charge, the applied offer and the platform fee. The ERP invoice order is
    // only a fallback when no store record exists (e.g. an order placed on
    // another device) — the download must match the Order Summary and Payment
    // Summary, not the backend's independent re-pricing.
    const base = storeFallback.data ?? query.data;
    if (!base || !orderDetail.data) return base;
    return enrichInvoiceFromOrder(base, orderDetail.data);
  }, [query.data, storeFallback.data, orderDetail.data]);

  const download = useCallback(() => {
    if (invoice) downloadInvoiceAsHtml(invoice);
  }, [invoice]);

  return {
    data: invoice,
    isLoading: query.isLoading,
    isError: query.isError,
    download,
  };
}

/** Cancel a Draft/cancellable order via the backend. */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      orderService.cancelOrder(orderId, reason),
    onSuccess: (updated, { orderId }) => {
      queryClient.setQueryData(ORDER_DETAIL_QUERY_KEY(orderId), updated);
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDER_TRACKING_QUERY_KEY(orderId) });
      queryClient.invalidateQueries({ queryKey: ORDER_INVOICE_QUERY_KEY(orderId) });
    },
  });
}

/** Recreate the cart from an existing order's items. */
export function useReorderOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => orderService.reorder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}