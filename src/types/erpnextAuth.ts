/**
 * ERPNext Auth API Types
 *
 * DTOs matching the KeeMeds Commerce ERPNext auth endpoints (Phase 12):
 *   - POST /api/method/keemeds_commerce.api.auth.register
 *   - POST /api/method/keemeds_commerce.api.auth.login
 *   - GET  /api/method/keemeds_commerce.api.auth.me
 *   - POST /api/method/keemeds_commerce.api.auth.logout
 *
 * Authentication uses the standard ERPNext session cookie (`sid`) only — no
 * JWT or localStorage tokens.
 */

/* ── Register request / response ── */

/** Payload sent to the register endpoint. Field names match the backend. */
export interface ErpRegisterPayload {
  email: string;
  full_name: string;
  mobile_no: string;
  password: string;
}

/** Profile shape returned by register / me for a website user. */
export interface ErpAuthUser {
  email: string;
  full_name: string;
  mobile_no: string;
  user_type: string;
  customer_name?: string;
  customer_id?: string;
}

/**
 * Success payload of a KeeMeds Commerce auth endpoint — the value returned
 * by the whitelisted method (`utils/api_response.success_response`).
 *
 * Frappe wraps every whitelisted method's return value under a top-level
 * `message` key on the HTTP response body, so the actual body received by the
 * client is `{ "message": { success, message, data } }` (e.g. login returns
 * `{"message":{"success":true,"message":"Login successful.","data":null}}`).
 */
export interface ErpAuthMessage<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/* ── Login request / response ── */

/** Payload sent to the login endpoint. */
export interface ErpLoginPayload {
  email: string;
  password: string;
}

/** HTTP response body of the login endpoint. */
export interface ErpLoginResponse {
  message: ErpAuthMessage<null>;
  home_page?: string;
  full_name?: string;
}

/* ── Logout response ── */

/** HTTP response body of the logout endpoint. */
export interface ErpLogoutResponse {
  message: ErpAuthMessage<null>;
  home_page: string;
  full_name: string;
}

/* ── Error responses ── */

/** Frappe error envelope surfaced for auth failures. */
export interface ErpAuthErrorResponse {
  message?: string;
  _server_messages?: string[];
  exc_type?: string;
  exception?: string;
}
