/**
 * Checkout Configuration
 *
 * Single source of truth for delivery options, delivery labels and payment
 * labels used across the checkout service (mock + future ERPNext), the
 * checkout hook, and order screens. Keeps displayed totals and order totals
 * in sync so the summary matches the placed order.
 */

import type { DeliveryOption, DeliverySpeed, PaymentMethodType } from "@/types/checkout";

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    speed: "standard",
    label: "Standard Delivery",
    description: "Delivered in 3-5 business days",
    estimatedDays: 4,
    estimatedDate: "Aug 28 - Aug 30",
    charge: 0,
  },
  {
    speed: "express",
    label: "Express Delivery",
    description: "Delivered in 1-2 business days",
    estimatedDays: 2,
    estimatedDate: "Aug 26 - Aug 27",
    charge: 4.99,
  },
  {
    speed: "same_day",
    label: "Same Day Delivery",
    description: "Delivered today by 9 PM",
    estimatedDays: 0,
    estimatedDate: "Today",
    charge: 9.99,
  },
];

export const DELIVERY_SPEED_LABELS: Record<DeliverySpeed, string> = {
  standard: "Standard Delivery (3-5 days)",
  express: "Express Delivery (1-2 days)",
  same_day: "Same Day Delivery",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  cod: "Cash on Delivery",
  upi: "UPI",
  card: "Credit / Debit Card",
  net_banking: "Net Banking",
  wallet: "Wallet",
};