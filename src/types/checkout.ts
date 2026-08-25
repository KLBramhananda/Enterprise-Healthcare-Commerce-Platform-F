/**
 * Checkout Domain Types
 *
 * Types for address management, delivery, prescriptions, payment,
 * promo codes, checkout session, and order lifecycle.
 * Designed to mirror the ERPNext API contract for seamless backend swap.
 */

import type { Product } from "./catalog";

/* ── Addresses ── */

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export type AddressFormData = Omit<Address, "id" | "isDefault">;

/* ── Delivery ── */

export type DeliverySpeed = "standard" | "express" | "same_day";

export interface DeliveryOption {
  speed: DeliverySpeed;
  label: string;
  description: string;
  estimatedDays: number;
  estimatedDate: string;
  charge: number;
}

/* ── Prescriptions ── */

export interface PrescriptionFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

/* ── Promo ── */

export interface AppliedPromo {
  code: string;
  discountPercent: number;
  discountAmount: number;
}

/* ── Payment ── */

export type PaymentMethodType = "cod" | "upi" | "card" | "net_banking" | "wallet";

export interface PaymentMethod {
  type: PaymentMethodType;
  label: string;
  description: string;
}

/* ── Checkout Session ── */

export interface CheckoutSession {
  addressId: string | null;
  deliverySpeed: DeliverySpeed;
  deliveryNote: string;
  prescriptionFiles: PrescriptionFile[];
  appliedPromo: AppliedPromo | null;
  paymentMethod: PaymentMethodType | null;
}

/* ── Order ── */

export type OrderStatus = "placed" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  address: Address;
  deliverySpeed: DeliverySpeed;
  deliveryNote: string;
  prescriptionFiles: PrescriptionFile[];
  subtotal: number;
  savings: number;
  deliveryCharge: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: PaymentMethodType;
  status: OrderStatus;
  placedAt: string;
  estimatedDelivery: string;
}

/* ── Order Summary ── */

export interface OrderSummary {
  subtotal: number;
  savings: number;
  deliveryCharge: number;
  discount: number;
  tax: number;
  grandTotal: number;
}

/* ── Validation ── */

export interface CheckoutValidation {
  hasAddress: boolean;
  hasPrescriptions: boolean;
  hasPaymentMethod: boolean;
  isCartNotEmpty: boolean;
  canPlaceOrder: boolean;
}
