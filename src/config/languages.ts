/**
 * Language Configuration
 *
 * Supported UI languages for the KeeMeds commerce frontend.
 *
 * Internationalization strategy:
 *   - Selection is persisted via the languageStore (localStorage) so the
 *     user's choice survives reloads and is available to a future i18n layer.
 *   - Content remains in English for now; `lang` is exposed on the document
 *     root so a full translation implementation can register `locales` by
 *     `code` without changing any UI code.
 *
 * Each entry maps to a BCP-47 locale tag. When an i18n library is adopted,
 * its message catalog is keyed by these same codes, so no UI changes are
 * required to go live.
 */

export interface LanguageOption {
  /** BCP-47 language tag (used as the i18n catalog key). */
  code: string;
  /** English name of the language. */
  name: string;
  /** Native (self-referential) label shown in the selector. */
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
] as const;

/** Default UI language used until the user makes an explicit choice. */
export const DEFAULT_LANGUAGE = "en";

export function getLanguageOption(code: string): LanguageOption {
  return LANGUAGES.find((lang) => lang.code === code) ?? LANGUAGES[0];
}
