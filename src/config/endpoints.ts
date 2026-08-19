/**
 * API Endpoints
 *
 * Centralized endpoint paths for all backend communication.
 * All paths are relative to the /api/method prefix.
 */

export const API_ENDPOINTS = {
  /**
   * Health check.
   */
  PING: "/ping",

  /**
   * Commerce module endpoints will be added here.
   * Example:
   * PRODUCTS: {
   *   LIST: "/keemeds_commerce.api.catalog.list_products",
   *   GET: "/keemeds_commerce.api.catalog.get_product",
   * },
   */
} as const;
