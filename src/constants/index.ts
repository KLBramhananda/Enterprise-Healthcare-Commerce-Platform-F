/**
 * App-wide constants.
 *
 * Re-exports from config/constants for convenience.
 * Additional app-level constants can be added here.
 */
export {
  APP_NAME,
  APP_TAGLINE,
  APP_DESCRIPTION,
  ANNOUNCEMENTS,
  ANNOUNCEMENT_TEXT,
  APP_STORE_URL,
  GOOGLE_PLAY_URL,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  DEBOUNCE_DELAY,
  COMMERCE_CATEGORIES,
} from "@/config/constants";
export type { CommerceCategory } from "@/config/constants";
export { LANGUAGES, DEFAULT_LANGUAGE, getLanguageOption } from "@/config/languages";
export type { LanguageOption } from "@/config/languages";
