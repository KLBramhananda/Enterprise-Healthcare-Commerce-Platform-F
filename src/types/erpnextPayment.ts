/**
 * ERPNext Payment API Types
 *
 * DTOs matching the live KeeMeds Commerce payment endpoints
 * (keemeds_commerce.api.payment):
 *
 *   - POST /api/method/keemeds_commerce.api.payment.create_payment
 *   - POST /api/method/keemeds_commerce.api.payment.verify_payment
 *   - POST /api/method/keemeds_commerce.api.payment.complete_payment
 *   - POST /api/method/keemeds_commerce.api.payment.retry_payment
 *   - POST /api/method/keemeds_commerce.api.payment.fail_payment
 *   - GET  /api/method/keemeds_commerce.api.payment.status?sales_order=...
 *   - GET  /api/method/keemeds_commerce.api.payment.history?sales_order=...
 *
 * Every endpoint wraps its payload in the shared `success_response` envelope
 * (mirrors `utils/api_response.py`):
 *
 *     { message: { success, message, data } }
 *
 * The DTOs mirror `keemeds_commerce.domain.payment` (PaymentSessionDTO /
 * PaymentCompletionDTO / PaymentStatusDTO / PaymentHistoryDTO) so the ERPnext
 * payment-confirmation flow maps one-to-one onto the backend contract.
 */

/** Outer `message` envelope shared by every payment endpoint. */
export interface ErpPaymentMessage<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Customer block inside the gateway-ready payload. */
export interface ErpPaymentCustomerDTO {
  id: string;
  name: string;
  email: string;
}

/** Gateway-ready payload returned by create_payment / retry_payment. */
export interface ErpPaymentGatewayPayloadDTO {
  gateway: string;
  method: string;
  order_id: string;
  session: string;
  sales_order: string;
  amount: string;
  amount_in_paise: number;
  currency: string;
  customer: ErpPaymentCustomerDTO;
  signature: string;
  verify_endpoint: string;
  status_endpoint: string;
}

/** A created (or replayed) gateway-ready payment session. */
export interface ErpPaymentSessionDTO {
  session: string;
  session_token: string;
  idempotency_key: string;
  sales_order: string;
  customer: string;
  customer_name: string;
  user_email: string;
  gateway: string;
  payment_method: string;
  amount: number;
  currency: string;
  amount_in_paise: number;
  status: string;
  signature: string;
  payload: ErpPaymentGatewayPayloadDTO;
  created_on: string;
}

/** Result of a successfully completed (paid) payment. */
export interface ErpPaymentCompletionDTO {
  success: boolean;
  session: string;
  sales_order: string;
  payment_entry: string;
  transaction_id: string;
  status: string;
  amount: number;
  currency: string;
}

/** Current payment status for an order or a session. */
export interface ErpPaymentStatusDTO {
  status: string;
  sales_order: string;
  session: string;
  amount: number;
  currency: string;
  transaction_id: string;
  payment_entry: string;
  failure_reason: string;
}

/** A single attempt in the payment history of an order. */
export interface ErpPaymentHistoryItemDTO {
  transaction_id: string;
  gateway: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  session: string;
  sales_order: string;
  payment_entry: string;
  failure_reason: string;
}

/** Ordered payment history for an order. */
export interface ErpPaymentHistoryDTO {
  sales_order: string;
  items: ErpPaymentHistoryItemDTO[];
  total: number;
}