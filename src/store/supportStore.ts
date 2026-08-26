/**
 * Support Store
 *
 * Zustand store for client-side support state with localStorage persistence.
 * Tracks recent help searches and auto-saved ticket drafts.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TicketFormData } from "@/types/support";

interface SupportState {
  recentSearches: string[];
  ticketDraft: TicketFormData | null;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  saveTicketDraft: (data: TicketFormData) => void;
  clearTicketDraft: () => void;
}

export const useSupportStore = create<SupportState>()(
  persist(
    (set) => ({
      recentSearches: [],
      ticketDraft: null,

      addRecentSearch: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return state;
          const next = [trimmed, ...state.recentSearches.filter((s) => s !== trimmed)].slice(0, 10);
          return { recentSearches: next };
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),

      saveTicketDraft: (data) => set({ ticketDraft: data }),

      clearTicketDraft: () => set({ ticketDraft: null }),
    }),
    {
      name: "keemeds-support",
      partialize: (state) => ({ recentSearches: state.recentSearches, ticketDraft: state.ticketDraft }),
    },
  ),
);
