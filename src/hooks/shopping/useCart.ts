/**
 * useCart
 *
 * Read + action hook for shopping cart state.
 * Wraps the Zustand cartStore with fine-grained selectors
 * and exposes all cart actions for components.
 */

import { useCartStore } from "@/store/cartStore";

export function useCart() {
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const totalMrp = useCartStore((s) => s.getTotalMrp());
  const totalSavings = useCartStore((s) => s.getTotalSavings());

  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getItem = useCartStore((s) => s.getItem);
  const isInCart = useCartStore((s) => s.isInCart);

  return {
    items,
    totalItems,
    totalPrice,
    totalMrp,
    totalSavings,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItem,
    isInCart,
  };
}

export type { CartItem } from "@/store/cartStore";
