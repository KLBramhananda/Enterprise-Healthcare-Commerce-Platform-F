/**
 * Account Store
 *
 * Zustand store for account preferences with localStorage persistence.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AccountPreferences } from "@/types/account";

interface AccountState {
  preferences: AccountPreferences;
  setPreferences: (prefs: Partial<AccountPreferences>) => void;
}

const DEFAULT_PREFERENCES: AccountPreferences = {
  emailNotifications: true,
  smsNotifications: true,
  promotionalEmails: true,
  language: "en",
};

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      preferences: { ...DEFAULT_PREFERENCES },

      setPreferences: (partial) =>
        set((state) => ({
          preferences: { ...state.preferences, ...partial },
        })),
    }),
    {
      name: "keemeds-account",
      partialize: (state) => ({ preferences: state.preferences }),
    },
  ),
);
