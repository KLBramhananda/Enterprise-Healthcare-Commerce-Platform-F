/**
 * API Endpoints
 *
 * Centralized endpoint paths for all backend communication.
 * All paths are relative to the configured API base URL (`API_BASE_URL`,
 * typically `/api/method`). Leading slashes are intentionally omitted so the
 * paths compose correctly with the client base URL.
 */

export const API_ENDPOINTS = {
  PING: "ping",

  AUTH: {
    LOGIN: "keemeds_commerce.api.auth.login",
    REGISTER: "keemeds_commerce.api.auth.register",
    LOGOUT: "keemeds_commerce.api.auth.logout",
    ME: "keemeds_commerce.api.auth.me",
    FORGOT_PASSWORD: "keemeds_commerce.api.auth.forgot_password",
    VERIFY_OTP: "keemeds_commerce.api.auth.verify_otp",
    RESET_PASSWORD: "keemeds_commerce.api.auth.reset_password",
  },
} as const;
