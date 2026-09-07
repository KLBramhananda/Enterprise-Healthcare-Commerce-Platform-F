/**
 * ERPNext Checkout API Types
 *
 * DTOs matching the live KeeMeds Commerce checkout endpoints
 * (keemeds_commerce.api.checkout):
 *
 *   - GET  /api/method/keemeds_commerce.api.checkout.summary
 *   - POST /api/method/keemeds_commerce.api.checkout.validate
 *   - POST /api/method/keemeds_commerce.api.checkout.create_order
 *
 * Verified response contract (Phase 18) against
 * `keemeds_commerce/domain/checkout.py` and `utils/api_response.success_response`:
 *
 *   summary / validate →
 *     { message: { success, message, data: ErpCheckoutSummaryDTO } }
 *
 *   create_order →
 *     { message: { success, message, data: ErpCheckoutOrderDTO } }
 *
 * All three accept the optional request fields `shipping_address_name` and
 * `billing_address_name` (the ERPNext Address names selected during checkout).
 */

/** A single checkout line item of the validated summary. */
export interface ErpCheckoutItemDTO {
  item_code: string;
  item_name: string;
  brand: string;
  image: string;
  quantity: number;
  selling_price: number;
  subtotal: number;
  stock_status: string;
}

/** Address as returned inline by the checkout summary endpoints. */
export interface ErpCheckoutAddressDTO {
  name: string;
  address_type: string;
  address_title: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email_id: string;
  is_primary_address: boolean;
  is_shipping_address: boolean;
}

/** Validated preview of the payable order (checkout.summary / checkout.validate). */
export interface ErpCheckoutSummaryDTO {
  user_email: string;
  customer_id: string;
  customer_name: string;
  currency: string;
  items: ErpCheckoutItemDTO[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping_charge: number;
  grand_total: number;
  shipping_address: ErpCheckoutAddressDTO | null;
  billing_address: ErpCheckoutAddressDTO | null;
}

/** Result of converting the checkout into a Draft Sales Order (create_order). */
export interface ErpCheckoutOrderDTO {
  sales_order: string;
  status: string;
  docstatus: number;
  grand_total: number;
  currency: string;
}

/** Outer `message` envelope shared by all checkout endpoints. */
export interface ErpCheckoutMessage<T> {
  success: boolean;
  message: string;
  data: T;
}