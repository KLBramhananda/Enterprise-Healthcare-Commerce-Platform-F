/**
 * CSRF Token Manager
 *
 * Handles Frappe/ERPNext CSRF token lifecycle for session-based auth.
 *
 * ERPNext requires a valid `X-Frappe-CSRF-Token` header on all state-changing
 * requests (POST, PUT, DELETE, PATCH) made under a session cookie.
 *
 * Strategy (standard ERPNext session flow — no network fetch):
 *   ERPNext sets a `csrf_token` cookie on the browser for the active session.
 *   The client echoes that cookie value back via the `X-Frappe-CSRF-Token`
 *   header. Reading the token from the cookie guarantees it matches what the
 *   server expects, so CSRF remains fully enforced without the need to call
 *   any CSRF endpoint.
 *
 *   Guests have no `csrf_token` cookie, so public state-changing endpoints
 *   (login / register) are sent without a CSRF header — which the backend
 *   accepts for whitelisted guest methods.
 *
 * Token lifecycle:
 *   - getToken()   → called by the request interceptor; returns cached or reads cookie
 *   - clearToken() → called on logout / auth failure to discard the cached token
 */

const CSRF_TOKEN_COOKIE = "csrf_token";
const CSRF_HEADER = "X-Frappe-CSRF-Token";

let cachedToken: string | null = null;

/* ── Cookie reader ── */

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/* ── Token fetching ── */

/**
 * Read the CSRF token from the `csrf_token` cookie set by ERPNext.
 * Guests (no cookie) get an empty string, which the client treats as
 * "no CSRF needed" for public methods.
 *
 * NOTE: This deliberately does NOT call any remote CSRF endpoint. The
 * previous implementation fetched
 * `frappe.core.doctype.csrf_token.csrf_token.get_csrf_token`, which does not
 * exist on this ERPNext instance and returned 417, poisoning subsequent state
 * changing requests with a mismatched/empty token (causing 400 CSRF failures).
 */
export async function fetchCsrfToken(): Promise<string> {
  const cookieToken = readCookie(CSRF_TOKEN_COOKIE);
  if (cookieToken) {
    cachedToken = cookieToken;
    return cookieToken;
  }
  return "";
}

/**
 * Get the current CSRF token, reading from the cookie if not cached.
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
