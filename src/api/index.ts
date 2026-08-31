/**
 * API Barrel
 *
 * Exports the shared HTTP client, request/error helpers, error model,
 * and logging utilities used by all backend-facing code.
 */

export { default as apiClient, apiRequest, getErrorMessage, cancellableRequest, isCancelledError } from "./client";
export type { CancellableRequest } from "./client";
export { ApiError, fromAxiosError, API_ERROR_LABELS } from "./errors";
export type { ApiErrorCategory, FieldError } from "./errors";
