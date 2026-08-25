/**
 * Application Constants
 *
 * Centralized constants used across the commerce application.
 */

export const APP_NAME = "KeeMeds";

export const APP_TAGLINE = "Your Trusted Healthcare Partner";

export const APP_DESCRIPTION = "KeeMeds - Online Healthcare Commerce Platform";

export const ANNOUNCEMENT_TEXT = "Free delivery on orders above $50 | Use code HEALTH20 for 20% off your first order";

export const DEFAULT_PAGE_SIZE = 20;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const DEBOUNCE_DELAY = 300;

export const API_TIMEOUT = 30000;

export const QUERY_STALE_TIME = 1000 * 60 * 5;

export const QUERY_RETRY_COUNT = 1;

export const COMMERCE_CATEGORIES = [
  "Medicines",
  "Wellness",
  "Lab Tests",
  "Health Devices",
  "Personal Care",
  "Nutrition",
  "Ayurveda",
  "Homeopathy",
] as const;

export type CommerceCategory = (typeof COMMERCE_CATEGORIES)[number];

export const CATALOG_PAGE_SIZE = 12;

/** Sort options for catalog listings (value matches CatalogSortOption). */
export const CATALOG_SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Customer Rating" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount", label: "Discount" },
  { value: "name_asc", label: "Name: A to Z" },
] as const;

/* ── Product Badge Config ── */

export const BADGE_STYLES: Record<string, { className: string }> = {
  new: { className: "bg-info-50 text-info-800 ring-1 ring-info-100" },
  bestseller: { className: "bg-warning-50 text-warning-800 ring-1 ring-warning-100" },
  trending: { className: "bg-brand-50 text-brand-800 ring-1 ring-brand-100" },
  prescription: { className: "bg-surface-100 text-surface-700 ring-1 ring-surface-200" },
  limited_offer: { className: "bg-danger-50 text-danger-800 ring-1 ring-danger-100" },
};

/* ── Collection Metadata ── */

export const COLLECTION_META: Record<string, { title: string; description: string; accent: string }> = {
  "best-sellers": {
    title: "Best Sellers",
    description: "Our most popular products loved by thousands of customers",
    accent: "brand",
  },
  trending: {
    title: "Trending Now",
    description: "Products that are gaining momentum this week",
    accent: "blue",
  },
  "new-arrivals": {
    title: "New Arrivals",
    description: "Freshly added products to our catalog",
    accent: "purple",
  },
  "deals-of-the-day": {
    title: "Deals of the Day",
    description: "Limited-time offers on top products",
    accent: "amber",
  },
  essentials: {
    title: "Health Essentials",
    description: "Must-have products for your everyday healthcare needs",
    accent: "green",
  },
  "staff-picks": {
    title: "Staff Picks",
    description: "Handpicked recommendations from our healthcare experts",
    accent: "pink",
  },
};
