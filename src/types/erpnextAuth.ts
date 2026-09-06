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

/** `message` envelope of a register / me response. */
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

/** Outer shape of a login response (adds home_page / full_name). */
export interface ErpLoginResponse {
  message: ErpAuthMessage<null>;
  home_page?: string;
  full_name?: string;
}

/* ── Logout response ── */

/** Outer shape of a logout response. */
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
