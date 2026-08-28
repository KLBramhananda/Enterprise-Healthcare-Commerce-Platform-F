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

export type PromoDiscountType = "percent" | "flat" | "free_delivery";

export interface AppliedPromo {
  code: string;
  discountPercent: number;
  discountAmount: number;
  /** Minimum cart subtotal required (inclusive). Optional. */
  minOrder?: number;
  /** How the discount is applied. Defaults to percent when omitted. */
  discountType?: PromoDiscountType;
}

/* ── Payment ── */

export type PaymentMethodType =
  | "cod"
  | "upi"
  | "card"
  | "net_banking"
  | "wallet"
  | "emi";

export interface PaymentMethod {
  type: PaymentMethodType;
  label: string;
  description: string;
}

export type CardNetwork = "visa" | "mastercard" | "rupay" | "amex";

/**
 * Discriminated union describing the concrete payment instrument a customer
 * picked during checkout. Only the UI builds these; the payment service
 * validates and processes them, and the order stores a human-friendly
 * `instrumentSummary` for the confirmation/detail screens.
 */
export type PaymentInstrument =
  | { kind: "cod" }
  | { kind: "upi"; vpa: string; app?: string }
  | {
      kind: "card";
      network: CardNetwork;
      isCredit: boolean;
      cardholderName: string;
      number: string;
      expiry: string;
      cvv: string;
    }
  | { kind: "net_banking"; bank: string }
  | { kind: "wallet"; wallet: string }
  | { kind: "emi"; bank: string; tenureMonths: number; cardholderName: string };

/* ── Payment Gateway (mock) ── */

export type PaymentStageId =
  | "connecting"
  | "authorizing"
  | "verifying"
  | "generating_order"
  | "creating_invoice"
  | "finalizing";

export interface PaymentStage {
  id: PaymentStageId;
  label: string;
  description: string;
}

export type PaymentFailureReason =
  | "declined"
  | "insufficient_funds"
  | "invalid_details"
  | "network_error"
  | "timeout";

export interface PaymentProcessingInput {
  orderId: string;
  method: PaymentMethodType;
  instrument: PaymentInstrument;
  amount: number;
}

export interface PaymentSuccessResult {
  status: "succeeded";
  transactionId: string;
  method: PaymentMethodType;
  amount: number;
  paidAt: string;
}

export interface PaymentFailureResult {
  status: "failed";
  stage: PaymentStageId;
  reason: PaymentFailureReason;
  message: string;
}

export type PaymentResult = PaymentSuccessResult | PaymentFailureResult;

export type OrderPaymentStatus = "pending" | "paid";

export interface OrderPaymentInfo {
  method: PaymentMethodType;
  status: OrderPaymentStatus;
  transactionId?: string;
  paidAt?: string;
  instrumentSummary?: string;
}

/* ── Checkout Session ── */

export interface CheckoutSession {
  addressId: string | null;
  deliverySpeed: DeliverySpeed;
  deliveryNote: string;
  prescriptionFiles: PrescriptionFile[];
  prescriptionUploadLater: boolean;
  appliedPromo: AppliedPromo | null;
  paymentMethod: PaymentMethodType | null;
  paymentInstrument: PaymentInstrument | null;
}

/* ── Order ── */

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  invoiceId: string;
  trackingId: string;
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
  payment: OrderPaymentInfo;
  status: OrderStatus;
  placedAt: string;
  estimatedDelivery: string;
}

/* ── Invoice ── */

export interface InvoiceLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  orderId: string;
  issuedAt: string;
  seller: {
    name: string;
    address: string;
    gstin?: string;
    contact?: string;
  };
  billingAddress: Address;
  items: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  tax: number;
  taxRate: number;
  grandTotal: number;
  paymentMethod: PaymentMethodType;
  transactionId?: string;
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
