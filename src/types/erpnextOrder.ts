/**
 * ERPNext Order API Types
 *
 * DTOs matching the live KeeMeds Commerce order endpoints
 * (keemeds_commerce.api.orders):
 *
 *   - GET  /api/method/keemeds_commerce.api.orders.list
 *   - GET  /api/method/keemeds_commerce.api.orders.detail?order_id=...
 *   - GET  /api/method/keemeds_commerce.api.orders.invoice?order_id=...
 *   - GET  /api/method/keemeds_commerce.api.orders.tracking?order_id=...
 *   - POST /api/method/keemeds_commerce.api.orders.cancel   { order_id, reason }
 *
 * Every endpoint wraps its payload in the shared `success_response` envelope:
 *
 *     { message: { success, message, data } }
 *
 * The DTOs mirror the ERPNext Sales Order document (name/status/docstatus/
 * transaction_date/delivery_date/grand_total/items/addresses) so they are
 * consistent with the checkout SummaryDTO family already used by the cart and
 * checkout services.
 */

import type { ErpCheckoutAddressDTO } from "./erpnextCheckout";

/** A single order line (mirrors a Sales Order Item row). */
export interface ErpOrderItemDTO {
  item_code: string;
  item_name: string;
  brand: string;
  image: string;
  quantity: number;
  selling_price: number;
  subtotal: number;
  stock_status?: string;
}

/** Full storefront order as returned by list/detail. */
export interface ErpOrderDTO {
  name: string;
  status: string;
  docstatus: number;
  creation?: string;
  transaction_date?: string;
  delivery_date?: string;
  currency?: string;
  grand_total: number;
  subtotal: number;
  discount: number;
  tax: number;
  shipping_charge: number;
  platform_fee?: number;
  items: ErpOrderItemDTO[];
  shipping_address?: ErpCheckoutAddressDTO | null;
  billing_address?: ErpCheckoutAddressDTO | null;
  payment_method?: string;
  mode_of_payment?: string;
  payment_status?: string;
  transaction_id?: string;
  instrument_summary?: string;
  tracking_id?: string;
  invoice_id?: string;
}

/** Payload of the list endpoint (tolerates both a bare array and a wrapper). */
export interface ErpOrderListDTO {
  orders?: ErpOrderDTO[];
  total?: number;
}

export type ErpOrderListPayload = ErpOrderDTO[] | ErpOrderListDTO;

/** Outer `message` envelope shared by every orders endpoint. */
export interface ErpOrderMessage<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ── Invoice ── */

export interface ErpInvoiceLineDTO {
  name?: string;
  item_code?: string;
  quantity: number;
  unit_price?: number;
  selling_price?: number;
  amount: number;
}

export interface ErpInvoiceDTO {
  id?: string;
  invoice_id?: string;
  order_id?: string;
  issued_at?: string;
  seller?: {
    name?: string;
    address?: string;
    gstin?: string;
    contact?: string;
  };
  billing_address?: ErpCheckoutAddressDTO | null;
  items?: ErpInvoiceLineDTO[];
  subtotal?: number;
  discount?: number;
  delivery_charge?: number;
  tax?: number;
  tax_rate?: number;
  platform_fee?: number;
  grand_total?: number;
  payment_method?: string;
  mode_of_payment?: string;
  transaction_id?: string;
  instrument_summary?: string;
}

/* ── Tracking ── */

export interface ErpTrackingEventDTO {
  key?: string;
  type?: string;
  label?: string;
  timestamp?: string;
  description?: string;
  is_completed?: boolean;
  is_current?: boolean;
  is_cancelled?: boolean;
  completed?: boolean;
  current?: boolean;
  cancelled?: boolean;
}

export interface ErpTrackingDTO {
  status?: string;
  events?: ErpTrackingEventDTO[];
}

/* ── Cancel ── */

/**
 * Result of cancelling (or deleting) a Draft Sales Order. May echo the full
 * cancelled order; otherwise the cancel service refetches it to return the
 * updated frontend Order.
 */
export interface ErpCancelResultDTO {
  sales_order?: string;
  status?: string;
  cancelled?: boolean;
  message?: string;
}