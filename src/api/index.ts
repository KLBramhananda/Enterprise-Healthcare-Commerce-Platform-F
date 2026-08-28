/**
 * API Barrel
 *
 * Exports the shared HTTP client and request/error helpers used by all
 * backend-facing code.
 */

export { default as apiClient, apiRequest, getErrorMessage } from "./client";