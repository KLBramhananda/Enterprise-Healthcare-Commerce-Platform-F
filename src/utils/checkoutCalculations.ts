/**
 * Checkout calculations
 *
 * Single source of truth for how the storefront computes every checkout total
 * (subtotal, savings, delivery charge, offer discount, tax, platform fee and
 * grand total) from the cart items + the selected delivery speed + the applied
 * offer.
 *
 * Both the checkout hook (which drives the reactive Order Summary) and the
 * checkout services (which record the totals on a placed Order and therefore
 * on the downloadable invoice) derive their math here, so the Order Summary,
 * the Review & Pay step, the payment screen and the invoice can never disagree
 * about an amount.
 *
 * Grand Total formula (used consistently everywhere):
 *   Grand Total = Item Price + Delivery Charge - Offer Discount + GST/Tax + Platform Fee
 *
 * with GST/Tax kept at 0 for now and the Platform Fee taken from
 * `config/checkout` (kept at the existing amount for now).
 */

import type { CartItem } from "@/store/cartStore";
import type { AppliedPromo, DeliverySpeed } from "@/types/checkout";
import { DELIVERY_OPTIONS, isFreeDeliveryEligible, PLATFORM_FEE } from "@/config/checkout";

/** Storefront GST rate — kept at 0 for now (GST/Tax line stays at ₹0). */
export const TAX_RATE = 0;

export interface CheckoutTotalsInput {
  items: CartItem[];
  appliedPromo: AppliedPromo | null | undefined;
  deliverySpeed: DeliverySpeed;
}

export interface CheckoutTotals {
  subtotal: number;
  savings: number;
  freeDelivery: boolean;
  deliveryCharge: number;
  discount: number;
  tax: number;
  platformFee: number;
  grandTotal: number;
}

export function computeCheckoutTotals({
  items,
  appliedPromo,
  deliverySpeed,
}: CheckoutTotalsInput): CheckoutTotals {
  const subtotal = Math.round(items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  ) * 100) / 100;
  const savings =
    Math.round(items.reduce(
      (sum, item) => sum + (item.product.mrp - item.product.price) * item.quantity,
      0,
    ) * 100) / 100;
  const freeDelivery = isFreeDeliveryEligible(appliedPromo, subtotal);
  const deliveryCharge = freeDelivery
    ? 0
    : DELIVERY_OPTIONS.find((option) => option.speed === deliverySpeed)?.charge ?? 0;
  const discount = appliedPromo?.discountAmount ?? 0;
  const tax = Math.round(Math.max(0, subtotal - discount) * TAX_RATE * 100) / 100;
  const platformFee = PLATFORM_FEE;
  const grandTotal =
    Math.round((subtotal - discount + deliveryCharge + tax + platformFee) * 100) / 100;

  return {
    subtotal,
    savings,
    freeDelivery,
    deliveryCharge,
    discount,
    tax,
    platformFee,
    grandTotal,
  };
}