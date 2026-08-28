/**
 * useNotifications
 *
 * Hook for notification operations.
 * Wraps the notification service with React Query for caching and mutations.
 * Unread count is derived from the notifications list + persisted store
 * to stay consistent across page reloads.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services/factory";
import { useNotificationStore } from "@/store/notificationStore";
import type { NotificationCategory } from "@/types/account";

const notificationService = services.notification;
const NOTIFICATIONS_QUERY_KEY = ["notifications"];

export function useNotifications(category?: NotificationCategory) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, category].filter(Boolean),
    queryFn: () => notificationService.getNotifications(category),
  });
}

export function useUnreadNotificationCount() {
  const { data: allNotifications = [] } = useNotifications();
  const readIds = useNotificationStore((s) => s.readIds);

  const unreadCount = allNotifications.filter(
    (n) => !readIds.has(n.id) && !n.read,
  ).length;

  return { data: unreadCount, isLoading: false };
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const storeMarkAsRead = useNotificationStore((s) => s.markAsRead);

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (_data, id) => {
      storeMarkAsRead(id);
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const storeMarkAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      const data = queryClient.getQueryData<import("@/types/account").Notification[]>(
        NOTIFICATIONS_QUERY_KEY,
      );
      if (data) {
        storeMarkAllAsRead(data.map((n) => n.id));
      }
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}
