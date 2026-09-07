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
  notifyActionError,
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
    async (id: string) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      try {
        await addCartItem(product);
        notifyAddedToCart(product);
      } catch (error) {
        notifyActionError(error);
      }
    },
    [products, addCartItem],
  );

  const handleToggleWishlist = useCallback(
    async (id: string) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      try {
        if (isInWishlist(id)) {
          await removeWishlistItem(id);
          notifyRemovedFromWishlist(product);
        } else {
          await addWishlistItem(product);
          notifyAddedToWishlist(product);
        }
      } catch (error) {
        notifyActionError(error);
      }
    },
    [products, isInWishlist, removeWishlistItem, addWishlistItem],
  );

  return { handleAddToCart, handleToggleWishlist, isInWishlist };
}