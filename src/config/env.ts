/**
 * Environment Configuration
 *
 * Centralized, environment-driven configuration for the KeeMeds frontend.
 * Every configurable value lives behind a VITE_* environment variable with a
 * sensible fallback, so the app runs standalone on any machine without
 * hardcoded URLs or magic numbers scattered through the code.
 *
 * Conventions:
 *   - All values are read from `import.meta.env` (inlined at build time by
 *     Vite). Vite requires the VITE_ prefix for browser-exposed variables.
 *   - Every getter returns a typed value with a documented default so the app
 *     boots cleanly even when no environment file is present.
 *   - Optional asset/upload base URLs default to empty strings; consuming code
 *     treats empty as "use relative/same-origin paths".
 *   - Do NOT put secrets here — anything in the browser bundle is public.
 */

/** Read a string variable, falling back when unset or empty. */
function readString(key: string, fallback: string): string {
  const value = (import.meta.env as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

/** Read a numeric variable (milliseconds, counts, ports), falling back when invalid. */
function readNumber(key: string, fallback: number): number {
  const value = (import.meta.env as Record<string, unknown>)[key];
  const parsed = typeof value === "string" ? Number(value.trim()) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Read a boolean flag ("1", "true", "yes", "on" are truthy). */
function readBoolean(key: string, fallback = false): boolean {
  const value = (import.meta.env as Record<string, unknown>)[key];
  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
  }
  return fallback;
}

/* ── Application identity ── */

/** Deployment environment: development | staging | production. */
export const APP_ENV = readString("VITE_APP_ENV", "development");

export const isProduction = APP_ENV === "production";

export const isDevelopment = APP_ENV === "development";

export const APP_NAME = readString("VITE_APP_NAME", "KeeMeds");

export const APP_TAGLINE = readString("VITE_APP_TAGLINE", "Your Trusted Healthcare Partner");

export const APP_DESCRIPTION = readString(
  "VITE_APP_DESCRIPTION",
  "KeeMeds - Online Healthcare Commerce Platform",
);

/* ── API / backend ── */

/**
 * Base URL used by the API client for all backend requests.
 * Dev default is a same-origin path (`/api/method`) routed by the Vite proxy;
 * set an absolute URL (e.g. `https://api.example.com/api/method`) for staging
 * or production builds served without the dev proxy.
 */
export const API_BASE_URL = readString("VITE_API_BASE_URL", "/api/method");

/** Underlying request timeout in milliseconds. */
export const API_TIMEOUT = readNumber("VITE_API_TIMEOUT", 30000);

/** Dev-server proxy target for `/api` requests (Vite config only). */
export const PROXY_TARGET = readString("VITE_PROXY_TARGET", "http://localhost:8000");

/** Dev-server port (Vite config only). */
export const DEV_PORT = readNumber("VITE_DEV_PORT", 5173);

/* ── Assets ── */

/**
 * Optional base URL for product/brand/collection images served from a CDN or
 * media server. Empty means images load from same-origin/relative paths.
 */
export const IMAGE_BASE_URL = readString("VITE_IMAGE_BASE_URL", "");

/** Optional base URL for user-uploaded files (prescriptions, avatars, etc.). */
export const UPLOAD_BASE_URL = readString("VITE_UPLOAD_BASE_URL", "");

/**
 * Resolve an asset path against the configured image base URL.
 * Absolute and data URLs pass through untouched.
 */
export function resolveAssetUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/* ── Mobile app store links ── */

export const APP_STORE_URL = readString(
  "VITE_APP_STORE_URL",
  "https://apps.apple.com/us/iphone/today",
);

export const GOOGLE_PLAY_URL = readString(
  "VITE_GOOGLE_PLAY_URL",
  "https://play.google.com/store/apps?hl=en_IN",
);

/* ── Data fetching defaults ── */

/** Default stale time for React Query caches (milliseconds). */
export const QUERY_STALE_TIME = readNumber("VITE_QUERY_STALE_TIME", 1000 * 60 * 5);

/** Default retry count for failed React Query requests. */
export const QUERY_RETRY_COUNT = readNumber("VITE_QUERY_RETRY_COUNT", 1);

/* ── Feature flags ── */

export interface FeatureFlags {
  /** Live chat / instant messaging support channel. */
  liveChat: boolean;
  /** Prescription upload during checkout and account flows. */
  prescriptionUpload: boolean;
  /** Loyalty / rewards program. */
  loyalty: boolean;
  /** Paid membership program. */
  membership: boolean;
  /** Referral program. */
  referral: boolean;
  /** Coupons & promo codes. */
  coupons: boolean;
  /** Mobile app download promo banner. */
  appDownload: boolean;
  /** Home delivery / same-day delivery options. */
  homeDelivery: boolean;
}

/** Application feature flags, each backed by a VITE_FEATURE_* variable. */
export const FEATURES: FeatureFlags = {
  liveChat: readBoolean("VITE_FEATURE_LIVE_CHAT", true),
  prescriptionUpload: readBoolean("VITE_FEATURE_PRESCRIPTION_UPLOAD", true),
  loyalty: readBoolean("VITE_FEATURE_LOYALTY", true),
  membership: readBoolean("VITE_FEATURE_MEMBERSHIP", true),
  referral: readBoolean("VITE_FEATURE_REFERRAL", true),
  coupons: readBoolean("VITE_FEATURE_COUPONS", true),
  appDownload: readBoolean("VITE_FEATURE_APP_DOWNLOAD", true),
  homeDelivery: readBoolean("VITE_FEATURE_HOME_DELIVERY", true),
};

/**
 * Runtime feature-flag lookup by key. Use `FEATURES` directly for static
 * access; this helper future-proofs dynamic (API-delivered) flag sources.
 */
export function isFeatureEnabled(name: keyof FeatureFlags): boolean {
  return FEATURES[name];
}