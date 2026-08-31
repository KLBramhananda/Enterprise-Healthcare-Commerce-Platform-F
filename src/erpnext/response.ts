/**
 * ERPNext Response Parser
 *
 * Standardized conversion between ERPNext/Frappe REST responses and
 * frontend-friendly ApiResponse / PaginatedResponse envelopes.
 *
 * Frappe response patterns handled:
 *   - RPC responses: { message: T }
 *   - REST GET single: { data: T }
 *   - REST GET list: { data: T[] }
 *   - Error responses: { message: string, _server_messages?: string[] }
 *   - Pagination metadata: { total, limit_start, limit_page_length }
 */

import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { AuditMeta } from "./types";
import { ApiError } from "@/api/errors";

/* ── RPC response parsing ── */

/**
 * Parse a Frappe RPC response (the raw axios response.data) into an ApiResponse.
 * RPC responses have the shape: { message: T }.
 */
export function parseRpcResponse<T>(raw: { message: T }): ApiResponse<T> {
  return {
    success: true,
    message: "ok",
    data: raw.message,
  };
}

/**
 * Parse a Frappe RPC response into a PaginatedResponse.
 * Expects the RPC to return { message: { data: T[], total: number, ... } }
 * or a plain array (treated as non-paginated).
 */
export function parseRpcPaginatedResponse<T>(
  raw: { message: unknown },
  fallbackPage = 1,
  fallbackPageSize = 20,
): PaginatedResponse<T> {
  const msg = raw.message;

  if (Array.isArray(msg)) {
    return {
      success: true,
      message: "ok",
      data: {
        items: msg as T[],
        total: msg.length,
        page: fallbackPage,
        page_size: fallbackPageSize,
      },
    };
  }

  if (msg && typeof msg === "object") {
    const obj = msg as Record<string, unknown>;
    const items = (obj.data ?? obj.docs ?? obj.message) as T[] | undefined;
    const total = (obj.total ?? obj.count) as number | undefined;

    return {
      success: true,
      message: "ok",
      data: {
        items: items ?? [],
        total: total ?? 0,
        page: (obj.page as number) ?? fallbackPage,
        page_size: (obj.page_size as number) ?? fallbackPageSize,
      },
    };
  }

  return {
    success: true,
    message: "ok",
    data: { items: [], total: 0, page: fallbackPage, page_size: fallbackPageSize },
  };
}

/* ── REST response parsing ── */

/**
 * Parse a Frappe REST GET response for a single document.
 * REST responses have the shape: { data: T }.
 */
export function parseDocResponse<T>(raw: { data: T }): ApiResponse<T> {
  return {
    success: true,
    message: "ok",
    data: raw.data,
  };
}

/**
 * Parse a Frappe REST GET response for a list of documents.
 * REST list responses: { data: T[] }.
 */
export function parseListResponse<T>(raw: { data: T[] }): ApiResponse<T[]> {
  return {
    success: true,
    message: "ok",
    data: raw.data,
  };
}

/**
 * Parse a Frappe REST list with pagination metadata.
 * Expects the response to contain total count info.
 */
export function parsePaginatedResponse<T>(
  raw: { data: T[]; total?: number },
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  return {
    success: true,
    message: "ok",
    data: {
      items: raw.data,
      total: raw.total ?? raw.data.length,
      page,
      page_size: pageSize,
    },
  };
}

/* ── Envelope wrappers ── */

/** Wrap any data in a standard success ApiResponse. */
export function ok<T>(data: T, message = "ok"): ApiResponse<T> {
  return { success: true, message, data };
}

/** Wrap any data in a standard PaginatedResponse. */
export function okPaginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  return {
    success: true,
    message: "ok",
    data: { items, total, page, page_size: pageSize },
  };
}

/** Create a failure ApiResponse (for mock service compatibility). */
export function fail<T = undefined>(message: string): ApiResponse<T> {
  return { success: false, message, data: undefined as T };
}

/* ── Audit metadata extraction ── */

/**
 * Extract audit metadata from a Frappe document.
 * Maps Frappe field names (snake_case) to frontend AuditMeta (camelCase).
 */
export function extractAudit(doc: Record<string, unknown>): AuditMeta {
  return {
    createdAt: String(doc.creation ?? ""),
    createdBy: String(doc.owner ?? ""),
    modifiedAt: String(doc.modified ?? ""),
    modifiedBy: String(doc.modified_by ?? ""),
  };
}

/* ── Error response parsing ── */

/** Shape of a typical Frappe error response body. */
interface FrappeErrorResponse {
  message?: string;
  _server_messages?: string[];
  exc_type?: string;
  code?: string;
}

/**
 * Extract a human-readable error message from a Frappe error response body.
 */
export function extractErrorMessage(data: unknown, fallback = "An error occurred"): string {
  if (!data || typeof data !== "object") return fallback;
  const obj = data as FrappeErrorResponse;
  return obj.message ?? fallback;
}

/**
 * Parse a Frappe error response into an ApiError.
 */
export function parseFrappeError(
  status: number,
  data: unknown,
  cause?: unknown,
): ApiError {
  const message = extractErrorMessage(data);
  return new ApiError({
    message,
    category: status >= 500 ? "serverError" : "badRequest",
    status,
    cause,
  });
}

/* ── Field error extraction ── */

/** A single validation error from Frappe. */
export interface FrappeFieldError {
  field: string;
  message: string;
}

/**
 * Extract field-level validation errors from a Frappe 422 response.
 * Frappe sends these in `_server_messages` as JSON-encoded strings.
 */
export function extractFieldErrors(data: unknown): FrappeFieldError[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  const messages = obj._server_messages;

  if (!Array.isArray(messages)) return [];

  return messages
    .map((msg) => {
      try {
        const parsed = typeof msg === "string" ? JSON.parse(msg) : msg;
        if (parsed && typeof parsed === "object" && "loc" in parsed) {
          const loc = (parsed as { loc?: string[] }).loc;
          const text = (parsed as { msg?: string }).msg ?? "Invalid value";
          return {
            field: Array.isArray(loc) ? loc.join(".") : "unknown",
            message: String(text),
          };
        }
      } catch {
        // Skip unparseable messages
      }
      return null;
    })
    .filter((e): e is FrappeFieldError => e !== null);
}
