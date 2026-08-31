/**
 * Token Manager
 *
 * Handles auth token lifecycle: storage, expiration detection,
 * and placeholders for refresh-token flow. Does NOT implement ERPNext
 * authentication — it works with the existing mock auth store.
 *
 * Future ERPNext integration:
 *   1. Implement `refreshAccessToken()` to call the ERPNext token endpoint.
 *   2. Set `TOKEN_EXPIRY_BUFFER_MS` to the appropriate buffer before expiry.
 *   3. The interceptor will automatically refresh before requests fail.
 */

import { useAuthStore } from "@/store/authStore";

/** Buffer before actual expiry to trigger a refresh (ms). */
const TOKEN_EXPIRY_BUFFER_MS = 60_000;

/** Maximum time to wait for a refresh to complete before failing (ms). */
const REFRESH_TIMEOUT_MS = 10_000;

let refreshPromise: Promise<boolean> | null = null;

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

/* ── Refresh flow (placeholder) ── */

/**
 * Attempt to refresh the access token using the stored refresh token.
 *
 * **Placeholder implementation** — returns false when no refresh token is
 * available or the refresh endpoint is not configured. When ERPNext auth is
 * implemented, replace the body of this function with:
 *
 *   const { refreshToken } = useAuthStore.getState().tokens ?? {};
 *   if (!refreshToken) return false;
 *   const response = await apiClient.post(API_ROUTES.AUTH.REFRESH_TOKEN, { refresh_token: refreshToken });
 *   useAuthStore.getState().setAuth(user, newTokens);
 *   return true;
 */
export async function refreshAccessToken(): Promise<boolean> {
  const { tokens } = useAuthStore.getState();
  if (!tokens?.refreshToken) return false;

  // Deduplicate concurrent refresh attempts
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      // Placeholder: In a real implementation this would call the refresh endpoint.
      // For now, return false to let the caller handle the failure gracefully.
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
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), REFRESH_TIMEOUT_MS)),
  ]);
}

/* ── Current token helpers ── */

/** Get the current access token, or null if not authenticated. */
export function getAccessToken(): string | null {
  const { tokens } = useAuthStore.getState();
  return tokens?.accessToken ?? null;
}

/** Check whether the current session has valid (non-expired) tokens. */
export function hasValidTokens(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Ensure the access token is valid, refreshing if needed.
 * Returns true if a valid token is available (existing or refreshed).
 * Returns false if the user needs to re-authenticate.
 */
export async function ensureValidToken(): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;
  if (!isTokenExpired(token)) return true;
  return refreshAccessToken();
}
