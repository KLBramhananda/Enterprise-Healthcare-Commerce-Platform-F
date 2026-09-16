/**
 * Cart Service contract
 *
 * The single interface the UI relies on for cart persistence. Under
 * LIVE_API the ERPNext implementation talks to keemeds_commerce.api.cart.*;
 * under STATIC the store falls back to local Zustand persistence and this
 * service is not invoked.
 */

import type { CartItem } from "@/store/cartStore";

/** React Query cache key for the server cart snapshot. */
export const CART_QUERY_KEY = ["cart"] as const;

export interface ICartService {
  getCart(): Promise<CartItem[]>;
  addItem(itemCode: string, quantity: number): Promise<CartItem[]>;
  updateItem(itemCode: string, quantity: number): Promise<CartItem[]>;
  removeItem(itemCode: string): Promise<CartItem[]>;
  clearCart(): Promise<CartItem[]>;
}
