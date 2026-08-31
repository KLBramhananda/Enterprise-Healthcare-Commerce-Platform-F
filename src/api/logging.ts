/**
 * API Request Logger (Development Only)
 *
 * Logs method, URL, duration, status, and errors for every API request
 * during development. Completely disabled in production builds via the
 * `ENABLE_API_LOGGING` feature flag — zero runtime cost in production.
 *
 * Usage: attach as an Axios interceptor pair on `apiClient`.
 */

import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { isDevelopment, API_LOGGING_ENABLED } from "@/config/env";

interface RequestLogEntry {
  method: string;
  url: string;
  startTime: number;
}

const activeRequests = new Map<string, RequestLogEntry>();

function requestId(config: AxiosRequestConfig): string {
  return `${config.method ?? "GET"}::${config.url ?? "unknown"}::${Date.now()}`;
}

function duration(start: number): string {
  return `${(performance.now() - start).toFixed(1)}ms`;
}

function statusColor(status: number): string {
  if (status < 300) return "color: #22c55e; font-weight: bold";
  if (status < 400) return "color: #f59e0b; font-weight: bold";
  if (status < 500) return "color: #ef4444; font-weight: bold";
  return "color: #dc2626; font-weight: bold";
}

/**
 * Attach development-only logging interceptors to an Axios instance.
 * Returns the same instance for chaining. No-op in production.
 */
export function attachLogger(instance: AxiosInstance): AxiosInstance {
  if (!isDevelopment || !API_LOGGING_ENABLED) return instance;

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const id = requestId(config);
    activeRequests.set(id, {
      method: (config.method ?? "GET").toUpperCase(),
      url: config.url ?? "unknown",
      startTime: performance.now(),
    });

    (config as AxiosRequestConfig & { _logId?: string })._logId = id;

    console.groupCollapsed(
      `%c🚀 ${config.method?.toUpperCase() ?? "GET"} %c${config.url}`,
      "color: #3b82f6; font-weight: bold",
      "color: #64748b",
    );
    if (config.params) console.log("Params:", config.params);
    if (config.data) console.log("Body:", config.data);

    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const id = (response.config as AxiosRequestConfig & { _logId?: string })._logId;
      const entry = id ? activeRequests.get(id) : undefined;

      if (entry && id) {
        const elapsed = duration(entry.startTime);
        console.log(
          `%c✓ ${entry.method} ${entry.url} %c${response.status} %c${elapsed}`,
          "color: #3b82f6",
          statusColor(response.status),
          "color: #94a3b8",
        );
        if (response.data) console.log("Response:", response.data);
        activeRequests.delete(id);
      }

      console.groupEnd();
      return response;
    },
    (error) => {
      const id = error?.config?._logId;
      const entry = id ? activeRequests.get(id) : undefined;
      const status = error?.response?.status;

      if (entry && id) {
        const elapsed = duration(entry.startTime);
        const label = status ? `${status}` : "NETWORK";
        console.log(
          `%c✗ ${entry.method} ${entry.url} %c${label} %c${elapsed}`,
          "color: #3b82f6",
          status ? statusColor(status) : "color: #ef4444",
          "color: #94a3b8",
        );
        console.error("Error:", error?.response?.data ?? error.message);
        activeRequests.delete(id);
      }

      console.groupEnd();
      return Promise.reject(error);
    },
  );

  return instance;
}
