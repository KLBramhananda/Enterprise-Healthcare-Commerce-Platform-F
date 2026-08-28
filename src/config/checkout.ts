/**
 * Checkout Configuration
 *
 * Single source of truth for delivery options, delivery labels and payment
 * labels used across the checkout service (mock + future ERPNext), the
 * checkout hook, and order screens. Keeps displayed totals and order totals
 * in sync so the summary matches the placed order.
 */

import type {
  DeliveryOption,
  DeliverySpeed,
  PaymentMethodType,
  AppliedPromo,
  PromoDiscountType,
} from "@/types/checkout";

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
  emi: "EMI",
};

export interface PaymentGroupDef {
  id: string;
  title: string;
  subtitle?: string;
  methods: PaymentMethodType[];
}

export const PAYMENT_METHOD_GROUPS: PaymentGroupDef[] = [
  {
    id: "cards",
    title: "Cards",
    subtitle: "Pay securely with your credit or debit card",
    methods: ["card", "emi"],
  },
  {
    id: "upi",
    title: "UPI",
    subtitle: "Instant payments using your UPI app",
    methods: ["upi"],
  },
  {
    id: "wallets",
    title: "Wallets",
    subtitle: "Prepaid digital wallets",
    methods: ["wallet"],
  },
  {
    id: "net_banking",
    title: "Net Banking",
    subtitle: "Pay directly from your bank account",
    methods: ["net_banking"],
  },
  {
    id: "cod",
    title: "Other",
    methods: ["cod"],
  },
];

export const CARD_NETWORKS = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "rupay", label: "RuPay" },
  { value: "amex", label: "American Express" },
] as const;

export const CARD_NETWORK_LABELS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  rupay: "RuPay",
  amex: "American Express",
};

export const UPI_APPS = [
  { value: "google_pay", label: "Google Pay" },
  { value: "phonepe", label: "PhonePe" },
  { value: "paytm", label: "Paytm UPI" },
  { value: "bhim", label: "BHIM" },
] as const;

export const NETBANKING_BANKS = [
  { value: "hdfc", label: "HDFC Bank" },
  { value: "icici", label: "ICICI Bank" },
  { value: "sbi", label: "State Bank of India" },
  { value: "axis", label: "Axis Bank" },
  { value: "kotak", label: "Kotak Mahindra Bank" },
] as const;

export const EMI_BANKS = [
  { value: "hdfc", label: "HDFC Bank" },
  { value: "icici", label: "ICICI Bank" },
  { value: "sbi", label: "State Bank of India" },
  { value: "axis", label: "Axis Bank" },
] as const;

export const WALLETS = [
  { value: "paytm", label: "Paytm Wallet" },
  { value: "amazon_pay", label: "Amazon Pay" },
  { value: "phonepe", label: "PhonePe Wallet" },
  { value: "mobikwik", label: "MobiKwik" },
] as const;

export const EMI_TENURES = [
  { value: 3, label: "3 months" },
  { value: 6, label: "6 months" },
  { value: 9, label: "9 months" },
  { value: 12, label: "12 months" },
] as const;

export const EMI_INTEREST_RATE = 0.13;

/* ── Demo Coupon Catalog (mock logic) ── */

export interface CheckoutOffer {
  code: string;
  title: string;
  detail: string;
  discountType: PromoDiscountType;
  /** Percent off when discountType === "percent". */
  discountPercent?: number;
  /** Flat amount off when discountType === "flat" (paid back on minOrder). */
  flatAmount?: number;
  /** Minimum cart subtotal required for the offer to apply. */
  minOrder?: number;
  /** Used by the offer card to hint how much the shopper saves. */
  badge?: string;
}

export const CHECKOUT_OFFERS: CheckoutOffer[] = [
  {
    code: "SAVE10",
    title: "Save 10%",
    detail: "Save 10% on your entire order.",
    discountType: "percent",
    discountPercent: 10,
    badge: "10% OFF",
  },
  {
    code: "NEWUSER20",
    title: "20% off first purchase",
    detail: "New customers get 20% off.",
    discountType: "percent",
    discountPercent: 20,
    badge: "20% OFF",
  },
  {
    code: "HEALTH50",
    title: "Free delivery above $499",
    detail: "Free delivery on orders above $499.",
    discountType: "free_delivery",
    minOrder: 499,
    badge: "FREE SHIPPING",
  },
  {
    code: "LAB20",
    title: "20% off Lab Tests",
    detail: "Flat 20% off on lab test bookings.",
    discountType: "percent",
    discountPercent: 20,
    badge: "20% OFF",
  },
  {
    code: "WELCOME100",
    title: "Flat $100 off above $999",
    detail: "Flat $100 off on orders above $999.",
    discountType: "flat",
    flatAmount: 100,
    minOrder: 999,
    badge: "$100 OFF",
  },
];

/** Pure rule shared by the UI and the (mock) checkout service. */
export function isFreeDeliveryEligible(
  promo: AppliedPromo | null | undefined,
  subtotal: number,
): boolean {
  if (!promo || promo.discountType !== "free_delivery") return false;
  const min = promo.minOrder ?? 0;
  return subtotal >= min;
}