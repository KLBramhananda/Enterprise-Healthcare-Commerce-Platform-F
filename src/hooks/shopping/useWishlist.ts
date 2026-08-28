/**
 * useWishlist
 *
 * Read + action hook for wishlist state.
 * Includes compound `moveToCart` action that transfers
 * an item from wishlist to cart in one operation.
 */

import { useCallback } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";

export function useWishlist() {
  const items = useWishlistStore((s) => s.items);
  const count = useWishlistStore((s) => s.getCount());

  const addItem = useWishlistStore((s) => s.addItem);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const getItem = useWishlistStore((s) => s.getItem);

  const moveToCart = useCallback(
    (productId: string) => {
      const item = getItem(productId);
      if (item) {
        useCartStore.getState().addItem(item.product);
        removeItem(productId);
      }
    },
    [getItem, removeItem],
  );

  return {
    items,
    count,
    addItem,
    removeItem,
    moveToCart,
    isInWishlist,
    clearWishlist,
  };
}

export type { WishlistItem } from "@/store/wishlistStore";
