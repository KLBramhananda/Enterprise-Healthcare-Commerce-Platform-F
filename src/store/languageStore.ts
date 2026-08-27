/**
 * Language Store
 *
 * Zustand store for the selected UI language with localStorage persistence.
 *
 * Persisted locally so the user's language preference survives reloads.
 * The value is a BCP-47 code from `src/config/languages`. The application
 * content remains in English for now; this store is the seam a full i18n
 * implementation plugs into (the code doubles as the catalog key), so the
 * LanguageSelector UI does not need to change when translations go live.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LANGUAGE, getLanguageOption, LANGUAGES } from "@/config/languages";

interface LanguageState {
  /** BCP-47 language tag of the active UI language. */
  locale: string;
  /** Sets the active UI language. */
  setLocale: (locale: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LANGUAGE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "keemeds-language",
      partialize: (state) => ({ locale: state.locale }),
      // Sanitize a persisted value that may have become stale (e.g. a code
      // removed from LANGUAGES) back to the default.
      merge: (persisted, current) => {
        const p = persisted as { locale?: string } | undefined;
        const locale =
          p?.locale && LANGUAGES.some((lang) => lang.code === p.locale) ? p.locale : current.locale;
        // Mirror the resolved value into document settings for i18n readiness.
        if (typeof document !== "undefined") {
          document.documentElement.lang = locale;
        }
        return { ...current, locale };
      },
      onRehydrateStorage: () => (state) => {
        const locale = state?.locale ?? DEFAULT_LANGUAGE;
        getLanguageOption(locale);
        if (typeof document !== "undefined") {
          document.documentElement.lang = locale;
        }
      },
    },
  ),
);
