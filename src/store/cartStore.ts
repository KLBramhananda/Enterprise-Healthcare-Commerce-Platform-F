/**
 * Cart Store
 *
 * Zustand store for shopping cart state with localStorage persistence.
 * Guest-friendly: no auth required. Auth gating happens in UI layer.
 * Stores full Product objects to avoid extra fetches for rendering.
 *
 * Under LIVE_API the store is a temporary client-side mirror of the ERPNext
 * cart (server is the source of truth): every mutation dispatches to the cart
 * service and re-hydrates from the authoritative response, and the sync
 * provider mirrors server snapshots fetched via React Query. Under STATIC the
 * store behaves exactly as before (purely local, no network).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/catalog";
import { DATA_SOURCE } from "@/config/env";
import { services } from "@/services/factory";
import { CART_QUERY_KEY } from "@/services/cartService";
import { queryClient } from "@/lib/queryClient";

const MAX_QUANTITY = 99;

/** Whether cart mutations should dispatch to the live ERPNext backend. */
const LIVE_SYNC_ENABLED = DATA_SOURCE === "LIVE_API";

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

interface CartState {
  items: CartItem[];

  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  /** Replace the mirror from an authoritative server snapshot. */
  hydrate: (items: CartItem[]) => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalMrp: () => number;
  getTotalSavings: () => number;
  getItem: (productId: string) => CartItem | undefined;
  isInCart: (productId: string) => boolean;
}

/** Apply an authoritative cart snapshot to the mirror + React Query cache. */
function applySnapshot(set: (fn: Partial<CartState>) => void, items: CartItem[]) {
  set({ items });
  queryClient.setQueryData(CART_QUERY_KEY, items);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        if (LIVE_SYNC_ENABLED) {
          return services.cart
            .addItem(product.id, quantity)
            .then((snapshot) => applySnapshot(set, snapshot));
        }
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + quantity) }
                  : i,
              ),
            };
          }
          return {
            items: [
              { product, quantity: Math.min(MAX_QUANTITY, quantity), addedAt: new Date().toISOString() },
              ...state.items,
            ],
          };
        });
        return Promise.resolve();
      },

      removeItem: (productId) => {
        if (LIVE_SYNC_ENABLED) {
          return services.cart
            .removeItem(productId)
            .then((snapshot) => applySnapshot(set, snapshot));
        }
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
        return Promise.resolve();
      },

      updateQuantity: (productId, quantity) => {
        if (LIVE_SYNC_ENABLED) {
          if (quantity <= 0) {
            return services.cart
              .removeItem(productId)
              .then((snapshot) => applySnapshot(set, snapshot));
          }
          return services.cart
            .updateItem(productId, quantity)
            .then((snapshot) => applySnapshot(set, snapshot));
        }
        if (quantity <= 0) {
          get().removeItem(productId);
          return Promise.resolve();
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: Math.min(MAX_QUANTITY, quantity) }
              : i,
          ),
        }));
        return Promise.resolve();
      },

      clearCart: () => {
        if (LIVE_SYNC_ENABLED) {
          return services.cart.clearCart().then(
            (snapshot) => applySnapshot(set, snapshot),
            () => {
              // The server cart could not be cleared (network hiccup, CSRF
              // hold…). Empty the mirror + cache anyway so the UI never shows
              // stale items after a successful payment; the ERP order caches
              // are invalidated separately.
              applySnapshot(set, []);
            },
          );
        }
        set({ items: [] });
        return Promise.resolve();
      },

      hydrate: (items) => set({ items }),

      getTotalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      },

      getTotalMrp: () => {
        return get().items.reduce((sum, i) => sum + i.product.mrp * i.quantity, 0);
      },

      getTotalSavings: () => {
        return get().getTotalMrp() - get().getTotalPrice();
      },

      getItem: (productId) => {
        return get().items.find((i) => i.product.id === productId);
      },

      isInCart: (productId) => {
        return get().items.some((i) => i.product.id === productId);
      },
    }),
    {
      name: "keemeds-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
