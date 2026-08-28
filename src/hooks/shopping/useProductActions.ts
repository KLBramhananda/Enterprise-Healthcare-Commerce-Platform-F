/**
 * useProductActions
 *
 * Shared add-to-cart / wishlist handlers for product grids.
 * Handlers are memoized against the products array so rendering N cards
 * doesn't recreate N arrow functions on every render. Expected usage:
 *
 *   const { handleAddToCart, handleToggleWishlist, isInWishlist } =
 *     useProductActions(products.items);
 */

import { useCallback } from "react";
import { useCart } from "./useCart";
import { useWishlist } from "./useWishlist";
import {
  notifyAddedToCart,
  notifyAddedToWishlist,
  notifyRemovedFromWishlist,
} from "@/utils/notifications";
import type { Product } from "@/types/catalog";

export function useProductActions<T extends Product>(products: T[]) {
  const { addItem: addCartItem } = useCart();
  const {
    isInWishlist,
    addItem: addWishlistItem,
    removeItem: removeWishlistItem,
  } = useWishlist();

  const handleAddToCart = useCallback(
    (id: string) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      addCartItem(product);
      notifyAddedToCart(product);
    },
    [products, addCartItem],
  );

  const handleToggleWishlist = useCallback(
    (id: string) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      if (isInWishlist(id)) {
        removeWishlistItem(id);
        notifyRemovedFromWishlist(product);
      } else {
        addWishlistItem(product);
        notifyAddedToWishlist(product);
      }
    },
    [products, isInWishlist, removeWishlistItem, addWishlistItem],
  );

  return { handleAddToCart, handleToggleWishlist, isInWishlist };
}