/**
 * Centralized API Error Model
 *
 * A single, exhaustive error type for all API communication. Every HTTP
 * status code, network failure, timeout, and cancellation maps to a
 * variant of `ApiError` so callers never need ad-hoc error inspection.
 *
 * Variants:
 *   - badRequest        400 — malformed / invalid payload
 *   - unauthorized      401 — missing or invalid credentials
 *   - forbidden         403 — valid credentials, insufficient permissions
 *   - notFound          404 — resource does not exist
 *   - conflict          409 — state conflict (e.g. duplicate email)
 *   - validationError   422 — server-side validation failure
 *   - rateLimited       429 — client hit rate limit
 *   - serverError       500+ — unhandled backend failure
 *   - timeout           request exceeded configured timeout
 *   - offline           no network connectivity
 *   - cancelled         request was cancelled by the caller
 */

import axios from "axios";

/* ── Error categories ── */

export type ApiErrorCategory =
  | "badRequest"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "conflict"
  | "validationError"
  | "rateLimited"
  | "serverError"
  | "timeout"
  | "offline"
  | "cancelled"
  | "unknown";

/* ── Validation field error ── */

export interface FieldError {
  field: string;
  message: string;
}

/* ── Structured API error ── */

export class ApiError extends Error {
  /** Machine-readable category for programmatic handling. */
  readonly category: ApiErrorCategory;
  /** HTTP status code (undefined for timeout/offline/cancelled). */
  readonly status: number | undefined;
  /** Backend error code string, if provided. */
  readonly code: string | undefined;
  /** Field-level validation errors (422 responses). */
  readonly fieldErrors: FieldError[];
  /** Original error for debugging. */
  readonly cause: unknown;

  constructor(params: {
    message: string;
    category: ApiErrorCategory;
    status?: number;
    code?: string;
    fieldErrors?: FieldError[];
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.category = params.category;
    this.status = params.status;
    this.code = params.code;
    this.fieldErrors = params.fieldErrors ?? [];
    this.cause = params.cause;
  }

  /* ── Category guards ── */

  get isClientError(): boolean {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status !== undefined && this.status >= 500;
  }

  get isRetryable(): boolean {
    return this.category === "timeout" || this.category === "offline" || this.category === "serverError";
  }

  get isAuthError(): boolean {
    return this.category === "unauthorized" || this.category === "forbidden";
  }
}

/* ── Category → status mapping ── */

const STATUS_CATEGORY_MAP: Array<[number, ApiErrorCategory]> = [
  [400, "badRequest"],
  [401, "unauthorized"],
  [403, "forbidden"],
  [404, "notFound"],
  [409, "conflict"],
  [422, "validationError"],
  [429, "rateLimited"],
];

function categoryFromStatus(status: number): ApiErrorCategory {
  for (const [code, category] of STATUS_CATEGORY_MAP) {
    if (status === code) return category;
  }
  if (status >= 500) return "serverError";
  return "unknown";
}

/* ── Field error extraction (Frappe/ERPNext style) ── */

interface FrappeValidationError {
  loc?: string[];
  msg?: string;
  msg_id?: string;
}

function extractFieldErrors(data: unknown): FieldError[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;

  const validations = obj._server_messages ?? obj.message;

  if (Array.isArray(validations)) {
    return validations
      .map((v: FrappeValidationError) => {
        if (typeof v === "object" && v !== null) {
          const field = Array.isArray(v.loc) ? v.loc.join(".") : String(v.loc ?? "unknown");
          return { field, message: String(v.msg ?? "Invalid value") };
        }
        return null;
      })
      .filter((e): e is FieldError => e !== null);
  }

  return [];
}

/* ── Constructor from Axios errors ── */

export function fromAxiosError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error)) {
    return new ApiError({
      message: "Request was cancelled",
      category: "cancelled",
      cause: error,
    });
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const backendMessage = (data?.message as string) ?? error.message;

    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return new ApiError({
        message: "Request timed out",
        category: "timeout",
        cause: error,
      });
    }

    if (!error.response) {
      return new ApiError({
        message: "Network error — you appear to be offline",
        category: "offline",
        cause: error,
      });
    }

    return new ApiError({
      message: String(backendMessage ?? `HTTP ${status}`),
      category: categoryFromStatus(status ?? 0),
      status,
      code: (data?.code as string) ?? undefined,
      fieldErrors: status === 422 ? extractFieldErrors(data) : [],
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message,
      category: "unknown",
      cause: error,
    });
  }

  return new ApiError({
    message: "An unknown error occurred",
    category: "unknown",
    cause: error,
  });
}

/* ── Human-readable category labels ── */

export const API_ERROR_LABELS: Record<ApiErrorCategory, string> = {
  badRequest: "Bad Request",
  unauthorized: "Unauthorized",
  forbidden: "Forbidden",
  notFound: "Not Found",
  conflict: "Conflict",
  validationError: "Validation Error",
  rateLimited: "Rate Limited",
  serverError: "Server Error",
  timeout: "Request Timed Out",
  offline: "Offline",
  cancelled: "Cancelled",
  unknown: "Unknown Error",
};
