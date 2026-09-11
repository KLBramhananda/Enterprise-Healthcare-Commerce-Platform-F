/**
 * API Configuration
 *
 * Centralizes all API-related constants: endpoint routes, default headers,
 * retry policy, and domain-specific route maps. This replaces any
 * hardcoded endpoint strings scattered through the codebase.
 */

/* ── API client defaults ── */

export const API_CONFIG = {
  /** Maximum number of automatic retries for retryable errors. */
  MAX_RETRIES: 2,
  /** Base delay between retries in ms (exponential backoff: delay * 2^attempt). */
  RETRY_DELAY_MS: 1000,
  /** Maximum retry delay cap in ms. */
  RETRY_MAX_DELAY_MS: 8000,
  /** Default request timeout in ms (overridden per-request via env). */
  DEFAULT_TIMEOUT: 30000,
  /** Content types accepted by the client. */
  ACCEPT_HEADER: "application/json",
  CONTENT_TYPE: "application/json",
} as const;

/* ── Endpoint routes ── */

/**
 * All API endpoint paths, organized by domain. Paths are relative to the
 * base URL (typically `/api/method`). The structure mirrors the future
 * ERPNext module layout so swapping is a path-only change.
 */
export const API_ROUTES = {
  /* ── Health ── */
  HEALTH: {
    PING: "ping",
    CHECK: "keemeds_commerce.api.health.check",
  },

  /* ── Auth ── */
  AUTH: {
    LOGIN: "keemeds_commerce.api.auth.login",
    REGISTER: "keemeds_commerce.api.auth.register",
    LOGOUT: "keemeds_commerce.api.auth.logout",
    ME: "keemeds_commerce.api.auth.me",
    FORGOT_PASSWORD: "keemeds_commerce.api.auth.forgot_password",
    VERIFY_OTP: "keemeds_commerce.api.auth.verify_otp",
    RESET_PASSWORD: "keemeds_commerce.api.auth.reset_password",
    REFRESH_TOKEN: "keemeds_commerce.api.auth.refresh_token",
    CSRF_TOKEN: "keemeds_commerce.api.auth.csrf_token",
  },

  /* ── Catalog ── */
  CATALOG: {
    CATEGORIES: "keemeds_commerce.api.catalog.categories",
    CATEGORY: (slug: string) => `keemeds_commerce.api.catalog.category?slug=${encodeURIComponent(slug)}`,
    PRODUCTS: "keemeds_commerce.api.catalog.products",
    PRODUCT: (id: string) => `keemeds_commerce.api.catalog.product?product_id=${encodeURIComponent(id)}`,
    RELATED: (id: string) => `keemeds_commerce.api.catalog.related?product_id=${encodeURIComponent(id)}`,
    SEARCH: "keemeds_commerce.api.catalog.search",
    SEARCH_SUGGESTIONS: "keemeds_commerce.api.catalog.search_suggestions",
    POPULAR_SEARCHES: "keemeds_commerce.api.catalog.popular_searches",
    BRAND_FACETS: "keemeds_commerce.api.catalog.brand_facets",
  },

  /* ── Products (ERPNext live product API) ── */
  PRODUCTS: {
    LIST: "keemeds_commerce.api.products.list_products",
    GET: "keemeds_commerce.api.products.get_product",
  },

  /* ── Brands / Collections ── */
  DISCOVERY: {
    BRANDS: "keemeds_commerce.api.discovery.brands",
    BRAND_BY_SLUG: (slug: string) => `keemeds_commerce.api.discovery.brand?slug=${encodeURIComponent(slug)}`,
    BRAND_PRODUCTS: (slug: string) => `keemeds_commerce.api.discovery.brand_products?slug=${encodeURIComponent(slug)}`,
    COLLECTIONS: "keemeds_commerce.api.discovery.collections",
    COLLECTION_BY_SLUG: (slug: string) => `keemeds_commerce.api.discovery.collection?slug=${encodeURIComponent(slug)}`,
    COLLECTION_PRODUCTS: (slug: string) => `keemeds_commerce.api.discovery.collection_products?slug=${encodeURIComponent(slug)}`,
    HEALTH_CONCERNS: "keemeds_commerce.api.discovery.health_concerns",
    HEALTH_CONCERN: (slug: string) => `keemeds_commerce.api.discovery.health_concern?slug=${encodeURIComponent(slug)}`,
    HEALTH_CONCERN_PRODUCTS: (slug: string) => `keemeds_commerce.api.discovery.health_concern_products?slug=${encodeURIComponent(slug)}`,
    BEST_SELLERS: "keemeds_commerce.api.discovery.best_sellers",
    TRENDING: "keemeds_commerce.api.discovery.trending",
    NEW_ARRIVALS: "keemeds_commerce.api.discovery.new_arrivals",
    SIMILAR: (id: string) => `keemeds_commerce.api.discovery.similar?product_id=${encodeURIComponent(id)}`,
    FREQUENTLY_BOUGHT_TOGETHER: (id: string) => `keemeds_commerce.api.discovery.fbt?product_id=${encodeURIComponent(id)}`,
  },

  /* ── Homepage ── */
  HOMEPAGE: {
    CONTENT: "keemeds_commerce.api.homepage.content",
  },

  /* ── Cart (keemeds_commerce.api.cart — implemented backend) ── */
  CART: {
    GET: "keemeds_commerce.api.cart.get_cart",
    ADD: "keemeds_commerce.api.cart.add_item",
    UPDATE: "keemeds_commerce.api.cart.update_item",
    REMOVE: "keemeds_commerce.api.cart.remove_item",
    CLEAR: "keemeds_commerce.api.cart.clear_cart",
  },

  /* ── Wishlist (keemeds_commerce.api.wishlist — implemented backend) ── */
  WISHLIST: {
    GET: "keemeds_commerce.api.wishlist.get_wishlist",
    ADD: "keemeds_commerce.api.wishlist.add_item",
    REMOVE: "keemeds_commerce.api.wishlist.remove_item",
  },

  /* ── Checkout (keemeds_commerce.api.checkout — implemented backend) ── */
  CHECKOUT: {
    SUMMARY: "keemeds_commerce.api.checkout.summary",
    VALIDATE: "keemeds_commerce.api.checkout.validate",
    CREATE_ORDER: "keemeds_commerce.api.checkout.create_order",
  },

  /* ── Payment (keemeds_commerce.api.payment — implemented backend) ── */
  PAYMENT: {
    CREATE: "keemeds_commerce.api.payment.create_payment",
    VERIFY: "keemeds_commerce.api.payment.verify_payment",
    COMPLETE: "keemeds_commerce.api.payment.complete_payment",
    RETRY: "keemeds_commerce.api.payment.retry_payment",
    FAIL: "keemeds_commerce.api.payment.fail_payment",
    STATUS: (orderId: string) => `keemeds_commerce.api.payment.status?sales_order=${encodeURIComponent(orderId)}`,
    STATUS_BY_SESSION: (session: string) => `keemeds_commerce.api.payment.status?session=${encodeURIComponent(session)}`,
    HISTORY: (orderId: string) => `keemeds_commerce.api.payment.history?sales_order=${encodeURIComponent(orderId)}`,
    WEBHOOK: "keemeds_commerce.api.payment.webhook",
  },

  /* ── Orders (keemeds_commerce.api.orders — production Order APIs) ── */
  ORDERS: {
    LIST: "keemeds_commerce.api.orders.list",
    DETAIL: (orderId: string) => `keemeds_commerce.api.orders.detail?order_id=${encodeURIComponent(orderId)}`,
    INVOICE: (orderId: string) => `keemeds_commerce.api.orders.invoice?order_id=${encodeURIComponent(orderId)}`,
    TRACKING: (orderId: string) => `keemeds_commerce.api.orders.tracking?order_id=${encodeURIComponent(orderId)}`,
    CANCEL: "keemeds_commerce.api.orders.cancel",
  },

  /* ── Addresses (customer address API — implemented in customer.py) ── */
  ADDRESSES: {
    LIST: "keemeds_commerce.api.customer.list_addresses",
    GET: "keemeds_commerce.api.customer.get_address",
    CREATE: "keemeds_commerce.api.customer.create_address",
    UPDATE: "keemeds_commerce.api.customer.update_address",
    DELETE: "keemeds_commerce.api.customer.delete_address",
    SET_DEFAULT: "keemeds_commerce.api.customer.set_default_shipping",
  },

  /* ── Account ── */
  ACCOUNT: {
    PROFILE: "keemeds_commerce.api.account.profile",
    UPDATE_PROFILE: "keemeds_commerce.api.account.update_profile",
    PREFERENCES: "keemeds_commerce.api.account.preferences",
    PRESCRIPTIONS: "keemeds_commerce.api.account.prescriptions",
    RETURN_REQUESTS: "keemeds_commerce.api.account.return_requests",
    TIMELINE: "keemeds_commerce.api.account.timeline",
  },

  /* ── Notifications ── */
  NOTIFICATIONS: {
    LIST: "keemeds_commerce.api.notifications.list",
    MARK_READ: "keemeds_commerce.api.notifications.mark_read",
    MARK_ALL_READ: "keemeds_commerce.api.notifications.mark_all_read",
    PREFERENCES: "keemeds_commerce.api.notifications.preferences",
  },

  /* ── Engagement ── */
  ENGAGEMENT: {
    OFFERS: "keemeds_commerce.api.engagement.offers",
    COUPONS: "keemeds_commerce.api.engagement.coupons",
    APPLY_COUPON: "keemeds_commerce.api.engagement.apply_coupon",
    LOYALTY: "keemeds_commerce.api.engagement.loyalty",
    LOYALTY_HISTORY: "keemeds_commerce.api.engagement.loyalty_history",
    REFERRAL: "keemeds_commerce.api.engagement.referral",
    MEMBERSHIP: "keemeds_commerce.api.engagement.membership",
    RECOMMENDATIONS: "keemeds_commerce.api.engagement.recommendations",
  },

  /* ── Support ── */
  SUPPORT: {
    FAQ: "keemeds_commerce.api.support.faq",
    TICKETS: "keemeds_commerce.api.support.tickets",
    TICKET: (id: string) => `keemeds_commerce.api.support.ticket?ticket_id=${encodeURIComponent(id)}`,
    CREATE_TICKET: "keemeds_commerce.api.support.create_ticket",
    TICKET_MESSAGES: (id: string) => `keemeds_commerce.api.support.ticket_messages?ticket_id=${encodeURIComponent(id)}`,
    ADD_MESSAGE: "keemeds_commerce.api.support.add_message",
    SEARCH: "keemeds_commerce.api.support.search",
    STATS: "keemeds_commerce.api.support.stats",
    RETURNS: "keemeds_commerce.api.support.returns",
    RETURN_DETAIL: (id: string) => `keemeds_commerce.api.support.return_detail?return_id=${encodeURIComponent(id)}`,
  },

  /* ── Prescription ── */
  PRESCRIPTION: {
    UPLOAD: "keemeds_commerce.api.prescription.upload",
    LIST: "keemeds_commerce.api.prescription.list",
  },
} as const;

/* ── Domain route groups (for convenience) ── */

export const PUBLIC_ROUTES = [
  API_ROUTES.HEALTH.PING,
  API_ROUTES.HEALTH.CHECK,
  API_ROUTES.AUTH.LOGIN,
  API_ROUTES.AUTH.REGISTER,
  API_ROUTES.AUTH.FORGOT_PASSWORD,
  API_ROUTES.AUTH.VERIFY_OTP,
  API_ROUTES.AUTH.RESET_PASSWORD,
] as const;

/** Check if a URL path requires authentication. */
export function isPublicRoute(url: string): boolean {
  return PUBLIC_ROUTES.some((route) => url.includes(route));
}
