/**
 * Shopping Sync Provider (LIVE_API mode)
 *
 * Bridges the ERPNext cart/wishlist backend with the client-side Zustand
 * mirror stores using React Query as the cache/invalidation hub:
 *
 *  1. Reads — while authenticated, ["cart"] / ["wishlist"] queries fetch the
 *     authoritative server state and hydrate the mirror stores (ERP is the
 *     single source of truth; Zustand stays a temporary render-time mirror).
 *     Window-focus refetch is enabled per-query so state converges across
 *     tabs (combined with Zustand's native cross-tab persistence events).
 *
 *  2. Writes — store mutations dispatch to the cart/wishlist services and
 *     re-hydrate from the authoritative response (see store modules).
 *
 *  3. Auth transitions — on login/session restore the queries are
 *     invalidated (auto-load); on logout/session expiry the mirror stores and
 *     both query caches are wiped so no user state leaks across sessions.
 *
 *  4. Post-payment sync — when a newly PAID order lands in the persisted
 *     checkout store, every ERP order cache (list/detail/tracking/invoice) is
 *     invalidated so the confirmed payment is reflected immediately.
 *
 * Under STATIC this provider is inert (queries disabled, ledger skipped) so
 * the mock stack behaves exactly as before.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { DATA_SOURCE } from "@/config/env";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { services } from "@/services/factory";
import { CART_QUERY_KEY } from "@/services/cartService";
import { WISHLIST_QUERY_KEY } from "@/services/wishlistService";
import { ORDER_QUERY_PREFIX_KEYS } from "@/services/orderService";
import { CHECKOUT_SUMMARY_QUERY_KEY } from "@/hooks/checkout/useCheckout";
import { invalidateOrderCaches } from "@/utils/orderCache";
import { queryClient } from "@/lib/queryClient";

/** Whether ERP-backed cart/wishlist sync is active for this build. */
const SYNC_ENABLED = DATA_SOURCE === "LIVE_API";

export function ShoppingSyncProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => services.cart.getCart(),
    enabled: SYNC_ENABLED && isAuthenticated,
    refetchOnWindowFocus: true,
  });

  const wishlistQuery = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => services.wishlist.getWishlist(),
    enabled: SYNC_ENABLED && isAuthenticated,
    refetchOnWindowFocus: true,
  });

  // Hydrate the mirror stores whenever an authoritative snapshot lands.
  useEffect(() => {
    if (cartQuery.data) useCartStore.getState().hydrate(cartQuery.data);
  }, [cartQuery.data]);

  useEffect(() => {
    if (wishlistQuery.data) useWishlistStore.getState().hydrate(wishlistQuery.data);
  }, [wishlistQuery.data]);

  // Auth-transition ledger: wipe on logout / re-fetch on login.
  const prevAuth = useRef(isAuthenticated);
  useEffect(() => {
    if (!SYNC_ENABLED) {
      prevAuth.current = isAuthenticated;
      return;
    }
    if (prevAuth.current && !isAuthenticated) {
      // Logged out / session expired → clear local cart + wishlist caches.
      useCartStore.getState().hydrate([]);
      useWishlistStore.getState().hydrate([]);
      // Reset the in-progress checkout session (selected address, promo,
      // payment method…) so it never leaks into the next sign-in. Placed
      // orders are intentionally kept in the persisted store.
      useCheckoutStore.getState().resetSession();
      queryClient.removeQueries({ queryKey: CART_QUERY_KEY });
      queryClient.removeQueries({ queryKey: WISHLIST_QUERY_KEY });
      queryClient.removeQueries({ queryKey: [CHECKOUT_SUMMARY_QUERY_KEY] });
      // Wipe the ERP order caches so one user's orders never surface for the
      // next session.
      for (const key of ORDER_QUERY_PREFIX_KEYS) {
        queryClient.removeQueries({ queryKey: key });
      }
    } else if (!prevAuth.current && isAuthenticated) {
      // Logged in → (re)fetch both from the server.
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      // Refresh the user's order history so it loads only their orders.
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_PREFIX_KEYS[0] });
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated]);

  // Post-payment sync: whenever a newly PAID order lands in the persisted
  // checkout store (the finalize path, a reorder, or a cross-tab sync), every
  // ERP order cache is invalidated so the Orders list, Order Detail payment
  // badge, Tracking timeline, Invoice, Dashboard recent orders and header
  // count reflect the confirmed state immediately — no browser refresh needed.
  useEffect(() => {
    if (!SYNC_ENABLED) return;
    let prevPaid = new Set(
      useCheckoutStore
        .getState()
        .orders.filter((o) => o.payment?.status === "paid")
        .map((o) => o.id),
    );
    const unsubscribe = useCheckoutStore.subscribe((state) => {
      const paid = new Set(
        state.orders.filter((o) => o.payment?.status === "paid").map((o) => o.id),
      );
      for (const id of paid) {
        if (!prevPaid.has(id)) void invalidateOrderCaches(queryClient, id);
      }
      prevPaid = paid;
    });
    return unsubscribe;
  }, []);

  return <>{children}</>;
}
