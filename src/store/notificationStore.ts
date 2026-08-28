/**
 * Notification Store
 *
 * Zustand store for notification read/unread state with localStorage persistence.
 * Tracks which notifications have been read for the notification badge count.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
  readIds: Set<string>;
  markAsRead: (id: string) => void;
  markAllAsRead: (ids: string[]) => void;
  isRead: (id: string) => boolean;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      readIds: new Set(),

      markAsRead: (id) =>
        set((state) => {
          const next = new Set(state.readIds);
          next.add(id);
          return { readIds: next };
        }),

      markAllAsRead: (ids) =>
        set((state) => {
          const next = new Set(state.readIds);
          for (const id of ids) next.add(id);
          return { readIds: next };
        }),

      isRead: (id) => get().readIds.has(id),
    }),
    {
      name: "keemeds-notifications",
      partialize: (state) => ({ readIds: Array.from(state.readIds) }),
      merge: (persisted, current) => {
        const data = persisted as { readIds?: string[] };
        return {
          ...current,
          readIds: new Set(data?.readIds ?? []),
        };
      },
    },
  ),
);
