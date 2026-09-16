/**
 * API Client
 *
 * Centralized HTTP client for all backend communication. Every API module and
 * future ERPNext service must use this client instead of creating its own
 * Axios instance.
 *
 * Responsibilities:
 *   - Base URL & timeout      → from environment config
 *   - Auth token injection    → Authorization header (token mode) or cookie (session mode)
 *   - Token expiration check  → attempts refresh before failing on 401
 *   - Retry with backoff      → automatic retries for timeout/server errors
 *   - Request cancellation    → AbortController support via `cancelToken`
 *   - Error normalization     → all errors become `ApiError` instances
 *   - Dev-only logging        → request/response logging when enabled
 *
 * Authentication modes:
 *   - Token mode (mock): Bearer token injected from the auth store
 *   - Session mode (ERPNext): Cookie-based auth (sid), no token injection
 *     needed. State-changing requests rely purely on the session cookie.
 */

import axios, { type AxiosRequestConfig, type CancelTokenSource } from "axios";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL, API_TIMEOUT, DATA_SOURCE } from "@/config/env";
import { API_CONFIG, API_ROUTES, isPublicRoute } from "@/config/api";
import { ApiError, fromAxiosError } from "./errors";
import { attachLogger } from "./logging";
import { ensureValidToken } from "@/auth";

/* ── Axios instance ── */

const rawClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": API_CONFIG.CONTENT_TYPE,
    Accept: API_CONFIG.ACCEPT_HEADER,
  },
});

/* ── CSRF token (ERPNext session mode) ──
 *
 * Frappe only enforces CSRF on POST/PUT/PATCH/DELETE requests, and only when
 * the request origin is not in `allowed_referrers` AND the session already
 * holds a stored csrf_token (typically after a Desk boot in the same browser).
 * A session that never received a token skips enforcement entirely, so a
 * failed token fetch here is never fatal — we simply omit the header.
 */

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string | null> | null = null;

async function ensureCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  if (!csrfTokenPromise) {
    csrfTokenPromise = rawClient
      .get<{ csrf_token?: string }>(API_ROUTES.AUTH.CSRF_TOKEN, {
        timeout: 10_000,
      })
      .then((response) => {
        csrfToken = response.data?.csrf_token ?? null;
        return csrfToken;
      })
      .catch(() => null)
      .finally(() => {
        csrfTokenPromise = null;
      });
  }
  return csrfTokenPromise;
}

/* ── Request interceptor: auth + CSRF ── */

rawClient.interceptors.request.use(async (config) => {
  const url = config.url ?? "";
  const method = (config.method ?? "get").toLowerCase();

  // Skip token logic for public endpoints (login/register/etc.)
  if (!isPublicRoute(url)) {
    const { authMode } = useAuthStore.getState();

    // In token mode (mock), inject a Bearer token. In session mode (ERPNext),
    // authentication relies purely on the session cookie (`sid`), so no
    // Authorization header is sent.
    if (authMode !== "session") {
      await ensureValidToken();
      const { tokens } = useAuthStore.getState();
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    }
  }

  // Attach the Frappe CSRF token to every state-changing request in live API
  // builds (session and token mode alike). This keeps authenticated POSTs
  // (payment create/verify, cart clear, etc.) working even when the browser's
  // cookie session already holds a csrf_token from a Desk boot, which Frappe
  // then enforces on every unsafe method. Never blocks the request when the
  // token can't be fetched — enforcement is skipped for untokened sessions.
  if (
    DATA_SOURCE === "LIVE_API" &&
    method !== "get" &&
    method !== "head" &&
    method !== "options"
  ) {
    const token = await ensureCsrfToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["X-Frappe-CSRF-Token"] = token;
    }
  }

  return config;
});

/* ── Response interceptor (auth + error normalization) ── */

rawClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | undefined = error?.response?.status;
    const url: string = error?.config?.url ?? "";

    // Let the public auth endpoints (login/register/forgot/etc.) surface
    // their own errors inline in the forms instead of hijacking the flow
    // with a redirect — a failed login (401) or a rejected register must
    // not navigate away or wipe the user's input.
    if (isPublicRoute(url)) {
      return Promise.reject(error);
    }

    // Never clear auth for the CSRF token endpoint — a 403 there means the
    // token is stale but the session may still be valid.
    const isCsrfEndpoint = url.includes(API_ROUTES.AUTH.CSRF_TOKEN);

    const { authMode, isAuthenticated, suppressPaymentAuthClear } = useAuthStore.getState();
    const isSessionMode = authMode === "session";

    // During payment finalization, suppress auth clearing so a transient 401/403
    // from a concurrent request (e.g. cart clear, CSRF token refresh) cannot
    // destroy the session mid-flow. The payment is already processed on the ERP
    // backend; destroying auth here would log the user out before they see the
    // confirmation screen.
    if (status === 401 && !suppressPaymentAuthClear) {
      // A single 401 on a private endpoint means the ERP session cookie is
      // genuinely gone. Only clear auth when the session is believed valid
      // (isAuthenticated = true) to avoid redundant Zustand state updates
      // that would trigger unnecessary route-guard re-renders.
      if (isAuthenticated) {
        useAuthStore.getState().clearAuth();
      }
    } else if (
      status === 403 &&
      !isCsrfEndpoint &&
      isSessionMode &&
      !suppressPaymentAuthClear
    ) {
      // Frappe returns 403 (not 401) for expired/invalid sessions and for
      // unauthenticated (Guest) requests on non-public endpoints. Only clear
      // local auth when the session was believed valid — avoids redirecting
      // to login while the ERP session is still valid (e.g. a transient
      // permission error on a non-critical endpoint).
      if (isAuthenticated) {
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  },
);

/* ── Attach dev logging ── */

export const apiClient = attachLogger(rawClient);

/* ── Retry logic ── */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sleepWithBackoff(attempt: number): Promise<void> {
  const exponentiallyDelayed = API_CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt);
  const capped = Math.min(exponentiallyDelayed, API_CONFIG.RETRY_MAX_DELAY_MS);
  // Add jitter: ±25%
  const jitter = capped * 0.25 * (Math.random() * 2 - 1);
  await delay(capped + jitter);
}

interface RetryableConfig extends AxiosRequestConfig {
  /** Maximum number of retries (overrides global default). */
  _retryMax?: number;
  /** Whether this request is eligible for retry (default: true for GET). */
  _retryable?: boolean;
}

/* ── Typed request helper with retry ── */

/**
 * Send a request through the shared client with automatic retry support.
 *
 * @param options - Axios request config (with optional `_retryMax` / `_retryable` overrides)
 * @returns The deserialized `data` payload for a successful (2xx) response.
 * @throws {ApiError} for any failure (after retries exhausted).
 */
export async function apiRequest<T>(options: RetryableConfig): Promise<T> {
  const maxRetries = options._retryMax ?? API_CONFIG.MAX_RETRIES;
  const isRetryable = options._retryable !== false && (options.method ?? "get").toLowerCase() === "get";

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiClient.request<T>(options);
      return response.data;
    } catch (err) {
      lastError = err;
      const apiErr = fromAxiosError(err);

      // Don't retry if: not retryable, client error, cancelled, or last attempt
      if (!isRetryable || apiErr.isClientError || apiErr.category === "cancelled" || attempt >= maxRetries) {
        throw apiErr;
      }

      await sleepWithBackoff(attempt);
    }
  }

  throw fromAxiosError(lastError);
}

/* ── Request cancellation ── */

export interface CancellableRequest<T> {
  /** The promise that resolves with the result. */
  promise: Promise<T>;
  /** Call to cancel the in-flight request. */
  cancel: () => void;
}

/**
 * Create a cancellable request. Returns the promise and a cancel function.
 *
 * Usage:
 *   const { promise, cancel } = cancellableRequest<Product[]>({ url: "/products" });
 *   // later: cancel() to abort
 */
export function cancellableRequest<T>(options: AxiosRequestConfig): CancellableRequest<T> {
  const source: CancelTokenSource = axios.CancelToken.source();

  const promise = apiClient
    .request<T>({ ...options, cancelToken: source.token })
    .then((res) => res.data);

  return {
    promise,
    cancel: () => source.cancel("Request cancelled by caller"),
  };
}

/**
 * Check if an error was caused by request cancellation.
 */
export function isCancelledError(error: unknown): boolean {
  return axios.isCancel(error);
}

/* ── Error helpers ── */

/**
 * Extract a human-readable message from an unknown error object.
 * Prefers the ApiError message, then backend-provided `message`, then Axios message.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError) return error.message;
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default apiClient;
