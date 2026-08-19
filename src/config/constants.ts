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
