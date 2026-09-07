/**
 * Wishlist Store
 *
 * Zustand store for wishlist state with localStorage persistence.
 * Guest-friendly: no auth required. Move-to-cart is a compound action
 * in the hook layer (useWishlist), not in the store itself.
 *
 * Under LIVE_API the store is a temporary client-side mirror of the ERPNext
 * wishlist (server is the source of truth): every mutation dispatches to the
 * wishlist service and re-hydrates from the authoritative response, and the
 * sync provider mirrors server snapshots fetched via React Query. Under
 * STATIC the store behaves exactly as before (purely local, no network).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/catalog";
import { DATA_SOURCE } from "@/config/env";
import { services } from "@/services/factory";
import { WISHLIST_QUERY_KEY } from "@/services/wishlistService";
import { queryClient } from "@/lib/queryClient";

/** Whether wishlist mutations should dispatch to the live ERPNext backend. */
const LIVE_SYNC_ENABLED = DATA_SOURCE === "LIVE_API";

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];

  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  /** Replace the mirror from an authoritative server snapshot. */
  hydrate: (items: WishlistItem[]) => void;

  isInWishlist: (productId: string) => boolean;
  getCount: () => number;
  getItem: (productId: string) => WishlistItem | undefined;
}

/** Apply an authoritative wishlist snapshot to the mirror + React Query cache. */
function applySnapshot(set: (fn: Partial<WishlistState>) => void, items: WishlistItem[]) {
  set({ items });
  queryClient.setQueryData(WISHLIST_QUERY_KEY, items);
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (LIVE_SYNC_ENABLED) {
          return services.wishlist
            .addItem(product.id)
            .then((snapshot) => applySnapshot(set, snapshot));
        }
        set((state) => {
          if (state.items.some((i) => i.product.id === product.id)) {
            return state;
          }
          return {
            items: [
              { product, addedAt: new Date().toISOString() },
              ...state.items,
            ],
          };
        });
        return Promise.resolve();
      },

      removeItem: (productId) => {
        if (LIVE_SYNC_ENABLED) {
          return services.wishlist
            .removeItem(productId)
            .then((snapshot) => applySnapshot(set, snapshot));
        }
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
        return Promise.resolve();
      },

      clearWishlist: () => {
        if (LIVE_SYNC_ENABLED) {
          // No bulk endpoint exists yet — clear item-by-item (each call
          // returns the authoritative remaining snapshot).
          const codes = get().items.map((i) => i.product.id);
          if (codes.length === 0) return Promise.resolve();
          return (async () => {
            let snapshot: WishlistItem[] = [];
            for (const code of codes) {
              snapshot = await services.wishlist.removeItem(code);
            }
            applySnapshot(set, snapshot);
          })();
        }
        set({ items: [] });
        return Promise.resolve();
      },

      hydrate: (items) => set({ items }),

      isInWishlist: (productId) => {
        return get().items.some((i) => i.product.id === productId);
      },

      getCount: () => get().items.length,

      getItem: (productId) => {
        return get().items.find((i) => i.product.id === productId);
      },
    }),
    {
      name: "keemeds-wishlist",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
