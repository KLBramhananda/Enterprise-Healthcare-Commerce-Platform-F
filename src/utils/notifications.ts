/**
 * Notification Helpers
 *
 * Centralized toast notifications for cart and wishlist actions.
 * Provides consistent messages, deduplication keys, and optional
 * "View Cart" actions across all pages.
 *
 * Requires calling `initNotifications(addToast)` once from a React component
 * (typically AppProvider or ToastProvider) to bind the toast function.
 */

import type { AddToastFn } from "@/providers/ToastProvider";
import type { Product } from "@/types/catalog";
import { cartDrawerEvents } from "./cartDrawerEvents";

let _addToast: AddToastFn | null = null;

export function initNotifications(addToast: AddToastFn): void {
  _addToast = addToast;
}

function notify(
  message: string,
  options?: { deduplicateKey?: string; action?: { label: string; onClick: () => void } },
): void {
  if (!_addToast) return;
  _addToast(message, "success", {
    deduplicateKey: options?.deduplicateKey,
    action: options?.action,
  });
}

function viewCartAction() {
  return {
    label: "View Cart",
    onClick: () => cartDrawerEvents.open(),
  };
}

export function notifyAddedToCart(product: Product, quantity?: number): void {
  const message =
    quantity && quantity > 1
      ? `${quantity}x ${product.name} added to cart`
      : `${product.name} added to cart`;

  notify(message, {
    deduplicateKey: `cart-add-${product.id}`,
    action: viewCartAction(),
  });
}

export function notifyAddedAllToCart(count: number): void {
  notify(`Added ${count} items to cart`, {
    action: viewCartAction(),
  });
}

export function notifyAddedToWishlist(product: Product): void {
  notify(`${product.name} added to wishlist`, {
    deduplicateKey: `wishlist-add-${product.id}`,
  });
}

export function notifyRemovedFromWishlist(product: Product): void {
  notify(`${product.name} removed from wishlist`, {
    deduplicateKey: `wishlist-remove-${product.id}`,
  });
}

export function notifyMovedToCart(product: Product): void {
  notify(`${product.name} moved to cart`, {
    deduplicateKey: `cart-move-${product.id}`,
    action: viewCartAction(),
  });
}
