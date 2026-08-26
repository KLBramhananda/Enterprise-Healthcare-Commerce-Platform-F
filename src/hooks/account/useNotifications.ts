/**
 * useNotifications
 *
 * Hook for notification operations.
 * Wraps the notification service with React Query for caching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MockNotificationService } from "@/services/notificationMock";
import { useNotificationStore } from "@/store/notificationStore";
import type { NotificationCategory } from "@/types/account";

const notificationService = new MockNotificationService();
const NOTIFICATIONS_QUERY_KEY = ["notifications"];
const UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"];

export function useNotifications(category?: NotificationCategory) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, category].filter(Boolean),
    queryFn: () => notificationService.getNotifications(category),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => notificationService.getUnreadCount(),
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const storeMarkAsRead = useNotificationStore((s) => s.markAsRead);

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (_data, id) => {
      storeMarkAsRead(id);
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const storeMarkAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: async () => {
      const data = queryClient.getQueryData<import("@/types/account").Notification[]>(
        NOTIFICATIONS_QUERY_KEY,
      );
      if (data) {
        storeMarkAllAsRead(data.map((n) => n.id));
      }
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
}
