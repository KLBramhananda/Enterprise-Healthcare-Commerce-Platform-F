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
 *   - CSRF token injection    → X-Frappe-CSRF-Token header for state-changing requests
 *   - Token expiration check  → attempts refresh before failing on 401
 *   - Retry with backoff      → automatic retries for timeout/server errors
 *   - Request cancellation    → AbortController support via `cancelToken`
 *   - Error normalization     → all errors become `ApiError` instances
 *   - Dev-only logging        → request/response logging when enabled
 *
 * Authentication modes:
 *   - Token mode (mock): Bearer token injected from the auth store
 *   - Session mode (ERPNext): Cookie-based auth (sid), no token injection
 *     needed; CSRF tokens are injected for state-changing requests
 */

import axios, { type AxiosRequestConfig, type CancelTokenSource } from "axios";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL, API_TIMEOUT } from "@/config/env";
import { API_CONFIG, isPublicRoute } from "@/config/api";
import { ApiError, fromAxiosError } from "./errors";
import { attachLogger } from "./logging";
import { ensureValidToken } from "@/auth";
import { getCsrfToken, applyCsrfHeader, clearCsrfToken } from "@/auth/csrfManager";

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

/* ── Request interceptor: auth + CSRF ── */

rawClient.interceptors.request.use(async (config) => {
  const url = config.url ?? "";
  const method = (config.method ?? "get").toLowerCase();
  const isStateChanging =
    method === "post" || method === "put" || method === "patch" || method === "delete";

  // Skip token logic for public endpoints
  if (!isPublicRoute(url)) {
    const { authMode, isAuthenticated } = useAuthStore.getState();

    if (authMode === "session") {
      // Session mode (ERPNext): rely on cookies, skip Bearer token injection.
      // CSRF token is required for state-changing requests.
      if (isStateChanging && isAuthenticated) {
        const csrfToken = await getCsrfToken();
        applyCsrfHeader(config, csrfToken);
      }
    } else {
      // Token mode (mock): inject Bearer token
      await ensureValidToken();
      const { tokens } = useAuthStore.getState();
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    }
  } else if (isStateChanging) {
    // Public endpoints with state-changing method still need CSRF (e.g. login)
    const csrfToken = await getCsrfToken();
    applyCsrfHeader(config, csrfToken);
  }

  return config;
});

/* ── Response interceptor (auth + error normalization) ── */

rawClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status: number | undefined = error?.response?.status;

    if (status === 401 || status === 403) {
      const { authMode } = useAuthStore.getState();

      // In session mode, a 401/403 means the session has expired.
      // Discard the CSRF token since it may be stale.
      if (authMode === "session") {
        clearCsrfToken();
      }

      useAuthStore.getState().clearAuth();

      const path = window.location.pathname;
      if (!path.startsWith("/auth/login")) {
        window.location.assign(
          `/auth/login?returnTo=${encodeURIComponent(path)}`,
        );
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
