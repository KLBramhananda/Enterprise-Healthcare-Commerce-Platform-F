/**
 * ERPNext Cart / Wishlist DTO types
 *
 * Source envelopes from the live KeeMeds Commerce API (cart.py / wishlist.py).
 * Every endpoint returns a success_response envelope:
 *   HTTP { message: { success, message, data } }
 *
 * Cart DTOs come straight from the shared Cart / CartItem domain objects;
 * wishlist rows are minimal (no price / Rx flags), so consumers enrich each
 * row via get_product before rendering (see erpNextProductResolver).
 */

/* ── Cart ── */

export interface ErpCartItemDTO {
  item_code: string;
  quantity: number;
  selling_price: number;
  item_name: string;
  brand: string;
  image: string;
  stock_status: string;
  subtotal: number;
}

export interface ErpCartDTO {
  items: ErpCartItemDTO[];
  total_items: number;
  subtotal: number;
  grand_total: number;
}

export interface ErpCartMessage {
  success: boolean;
  message: string;
  data: ErpCartDTO;
}

/* ── Wishlist ── */

export interface ErpWishlistItemDTO {
  item_code: string;
  item_name: string;
  brand: string;
  image: string;
}

export interface ErpWishlistDTO {
  items: ErpWishlistItemDTO[];
  total_items: number;
}

export interface ErpWishlistMessage {
  success: boolean;
  message: string;
  data: ErpWishlistDTO;
}
