/**
 * CSRF Token Manager
 *
 * Handles Frappe/ERPNext CSRF token lifecycle. ERPNext requires a valid
 * CSRF token for all state-changing requests (POST, PUT, DELETE, PATCH).
 *
 * Strategy:
 *   1. Fetch token via the Frappe API endpoint on first use
 *   2. Cache for the session lifetime (until page reload or logout)
 *   3. Read from cookie as a fallback
 *   4. Provide to HTTP client request interceptor
 *
 * Token lifecycle:
 *   - fetchToken() → called on app init if authenticated
 *   - getToken()   → called by request interceptor, returns cached or fetches
 *   - clearToken() → called on logout to discard cached token
 */

import { apiClient } from "@/api/client";

const CSRF_TOKEN_COOKIE = "csrf_token";
const CSRF_TOKEN_ENDPOINT = "frappe.core.doctype.csrf_token.csrf_token.get_csrf_token";
const CSRF_HEADER = "X-Frappe-CSRF-Token";

let cachedToken: string | null = null;

/* ── Cookie reader ── */

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/* ── Token fetching ── */

/**
 * Fetch a fresh CSRF token from ERPNext and cache it.
 * Uses the shared apiClient so interceptors are bypassed (endpoint is public).
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await apiClient.get<{ message: string }>(CSRF_TOKEN_ENDPOINT);
    const token = response.data.message;
    if (token) {
      cachedToken = token;
      return token;
    }
  } catch {
    // Swallow — fallback to cookie below
  }

  const cookieToken = readCookie(CSRF_TOKEN_COOKIE);
  if (cookieToken) {
    cachedToken = cookieToken;
    return cookieToken;
  }

  return "";
}

/**
 * Get the current CSRF token, fetching if not cached.
 * Returns empty string if unavailable (guest sessions don't need CSRF).
 */
export async function getCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  return fetchCsrfToken();
}

/**
 * Synchronously read the CSRF token from cookie (for initial bootstrap).
 * Returns null if not available.
 */
export function readCsrfTokenFromCookie(): string | null {
  return readCookie(CSRF_TOKEN_COOKIE);
}

/* ── Token lifecycle ── */

/** Discard the cached CSRF token (call on logout). */
export function clearCsrfToken(): void {
  cachedToken = null;
}

/** Inject the CSRF token header into an Axios request config. */
export function applyCsrfHeader(
  config: { headers?: Record<string, string> },
  token: string,
): void {
  if (token) {
    config.headers = config.headers ?? {};
    config.headers[CSRF_HEADER] = token;
  }
}

export { CSRF_HEADER };
