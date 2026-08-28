/**
 * API Client
 *
 * Centralized HTTP client for all backend communication. Every API module and
 * future ERPNext service must use this client instead of creating its own
 * Axios instance.
 *
 * Responsibilities centralized here:
 *   - Base URL            → from environment config (`API_BASE_URL`)
 *   - Request config      → withCredentials, headers, request timeout
 *   - Auth token injection→ Authorization header from the persisted auth store
 *   - Error handling      → 401/403 clear session + redirect to login;
 *                           normalized error messages via `getErrorMessage`
 *
 * Note: the current services are all mock implementations and never touch the
 * network. This client is the integration surface that ERPNext services will
 * use when mocks are swapped out.
 */

import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL, API_TIMEOUT } from "@/config/env";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/** Inject the persisted access token into every authenticated request. */
apiClient.interceptors.request.use((config) => {
  const { tokens } = useAuthStore.getState();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

/** Centralized response error handling. */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status: number | undefined = error?.response?.status;

    if (status === 401 || status === 403) {
      useAuthStore.getState().clearAuth();
      const path = window.location.pathname;
      if (!path.startsWith("/auth/login")) {
        window.location.assign("/auth/login");
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Typed request helper. Sends a request through the shared client (token
 * injection and error handling applied automatically) and returns the
 * deserialized `data` payload for a successful (2xx) response.
 */
export async function apiRequest<T>(options: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(options);
  return response.data;
}

/**
 * Extract a human-readable message from an unknown error object.
 * Prefers the backend-provided `message`, falls back to the Axios message.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default apiClient;