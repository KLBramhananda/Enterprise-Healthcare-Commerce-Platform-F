/**
 * Cart Store
 *
 * Zustand store for shopping cart state with localStorage persistence.
 * Guest-friendly: no auth required. Auth gating happens in UI layer.
 * Stores full Product objects to avoid extra fetches for rendering.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/catalog";

const MAX_QUANTITY = 99;

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

interface CartState {
  items: CartItem[];

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalMrp: () => number;
  getTotalSavings: () => number;
  getItem: (productId: string) => CartItem | undefined;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
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
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: Math.min(MAX_QUANTITY, quantity) }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

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
