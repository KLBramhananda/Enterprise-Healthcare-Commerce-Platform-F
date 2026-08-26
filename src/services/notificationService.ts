/**
 * Notification Service Interface
 *
 * Defines the contract for notification operations.
 * UI depends ONLY on this interface — swap MockNotificationService
 * with ErpNextNotificationService for backend integration.
 */

import type { Notification, NotificationCategory } from "@/types/account";

export interface INotificationService {
  getNotifications(category?: NotificationCategory): Promise<Notification[]>;
  getUnreadCount(): Promise<number>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}
