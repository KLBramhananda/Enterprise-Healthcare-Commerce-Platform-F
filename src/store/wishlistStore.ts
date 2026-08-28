/**
 * Wishlist Store
 *
 * Zustand store for wishlist state with localStorage persistence.
 * Guest-friendly: no auth required. Move-to-cart is a compound action
 * in the hook layer (useWishlist), not in the store itself.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/catalog";

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];

  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;

  isInWishlist: (productId: string) => boolean;
  getCount: () => number;
  getItem: (productId: string) => WishlistItem | undefined;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
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
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      clearWishlist: () => set({ items: [] }),

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
