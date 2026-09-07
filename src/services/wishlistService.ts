/**
 * Wishlist Service contract
 *
 * The single interface the UI relies on for wishlist persistence. Under
 * LIVE_API the ERPNext implementation talks to keemeds_commerce.api.wishlist.*;
 * under STATIC the store falls back to local Zustand persistence and this
 * service is not invoked.
 */

import type { WishlistItem } from "@/store/wishlistStore";

/** React Query cache key for the server wishlist snapshot. */
export const WISHLIST_QUERY_KEY = ["wishlist"] as const;

export interface IWishlistService {
  getWishlist(): Promise<WishlistItem[]>;
  addItem(itemCode: string): Promise<WishlistItem[]>;
  removeItem(itemCode: string): Promise<WishlistItem[]>;
}
