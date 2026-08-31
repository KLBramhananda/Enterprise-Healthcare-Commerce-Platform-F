/**
 * Token Manager
 *
 * Handles auth token lifecycle: storage, expiration detection,
 * and token refresh flow. Supports both token-based (mock) and
 * session-based (ERPNext) authentication modes.
 *
 * Token-based mode (mock):
 *   - JWT access tokens with expiry checking
 *   - Refresh token flow for renewal
 *
 * Session-based mode (ERPNext):
 *   - Cookie-based sessions (sid cookie sent by browser)
 *   - No JWT tokens — "session" marker stored in tokens.accessToken
 *   - Token checks are skipped; session validity is verified
 *     via the ERPNext current-user endpoint instead
 */

import { useAuthStore } from "@/store/authStore";

/** Buffer before actual expiry to trigger a refresh (ms). */
const TOKEN_EXPIRY_BUFFER_MS = 60_000;

/** Maximum time to wait for a refresh to complete before failing (ms). */
const REFRESH_TIMEOUT_MS = 10_000;

let refreshPromise: Promise<boolean> | null = null;

/* ── Session mode detection ── */

/** Check if the store is in ERPNext session-based auth mode. */
function isSessionMode(): boolean {
  return useAuthStore.getState().authMode === "session";
}

/* ── Token inspection ── */

/**
 * Decode a JWT payload without verification (client-side only).
 * Returns null if the token is malformed or not a JWT.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(""),
    );
    return JSON.parse(jsonPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Check whether a token is expired or about to expire. */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return false;
  const expiresAt = payload.exp * 1000;
  return Date.now() >= expiresAt - TOKEN_EXPIRY_BUFFER_MS;
}

/** Get the expiration timestamp of a JWT (ms since epoch), or null. */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return null;
  return payload.exp * 1000;
}

/* ── Refresh flow ── */

/**
 * Attempt to refresh the access token using the stored refresh token.
 * In session-based mode, always returns false (sessions use cookies).
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (isSessionMode()) return false;

  const { tokens } = useAuthStore.getState();
  if (!tokens?.refreshToken) return false;

  // Deduplicate concurrent refresh attempts
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      // Placeholder: In a real implementation this would call the refresh endpoint.
      return false;
    } catch {
      useAuthStore.getState().clearAuth();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return Promise.race([
    refreshPromise,
    new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(false), REFRESH_TIMEOUT_MS),
    ),
  ]);
}

/* ── Current token helpers ── */

/** Get the current access token, or null if not authenticated. */
export function getAccessToken(): string | null {
  const { tokens } = useAuthStore.getState();
  return tokens?.accessToken ?? null;
}

/**
 * Check whether the current session has valid (non-expired) tokens.
 * In session mode, returns true if authenticated (session cookie handles validity).
 */
export function hasValidTokens(): boolean {
  if (isSessionMode()) {
    return useAuthStore.getState().isAuthenticated;
  }
  const token = getAccessToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Ensure the access token is valid, refreshing if needed.
 * In session mode, returns true if authenticated.
 * Returns false if the user needs to re-authenticate.
 */
export async function ensureValidToken(): Promise<boolean> {
  if (isSessionMode()) {
    return useAuthStore.getState().isAuthenticated;
  }
  const token = getAccessToken();
  if (!token) return false;
  if (!isTokenExpired(token)) return true;
  return refreshAccessToken();
}
