/**
 * Mock Notification Service
 *
 * In-memory mock implementation of INotificationService.
 * Pre-seeded with healthcare-themed notifications.
 */

import type { Notification, NotificationCategory } from "@/types/account";
import type { INotificationService } from "./notificationService";

const now = new Date();
function daysAgo(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
function hoursAgo(hours: number): string {
  const d = new Date(now);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    title: "Order Confirmed",
    message: "Your order ORD-1001 has been confirmed and is being prepared.",
    category: "order",
    read: false,
    createdAt: hoursAgo(2),
    actionUrl: "/account/orders/ORD-1001",
  },
  {
    id: "notif-002",
    title: "Prescription Approved",
    message: "Your prescription uploaded on Aug 20 has been verified and approved.",
    category: "prescription",
    read: false,
    createdAt: hoursAgo(5),
    actionUrl: "/account/prescriptions",
  },
  {
    id: "notif-003",
    title: "Health Tip: Stay Hydrated",
    message: "Drinking 8 glasses of water daily can improve your energy and brain function.",
    category: "health",
    read: true,
    createdAt: daysAgo(1),
  },
  {
    id: "notif-004",
    title: "Order Shipped",
    message: "Your order ORD-1000 is on its way! Track your delivery in real time.",
    category: "order",
    read: false,
    createdAt: daysAgo(1),
    actionUrl: "/account/orders/ORD-1000",
  },
  {
    id: "notif-005",
    title: "Weekend Health Sale",
    message: "Get up to 30% off on wellness products. Offer ends Sunday.",
    category: "promotion",
    read: true,
    createdAt: daysAgo(2),
  },
  {
    id: "notif-006",
    title: "System Maintenance",
    message: "Scheduled maintenance on Aug 28 from 2 AM to 4 AM IST. Services may be briefly unavailable.",
    category: "system",
    read: true,
    createdAt: daysAgo(3),
  },
  {
    id: "notif-007",
    title: "Order Delivered",
    message: "Your order ORD-0998 has been delivered. We hope you are satisfied!",
    category: "order",
    read: true,
    createdAt: daysAgo(4),
    actionUrl: "/account/orders/ORD-0998",
  },
  {
    id: "notif-008",
    title: "Prescription Expiring Soon",
    message: "Your prescription for Metformin 500mg will expire on Sep 15. Please consult your doctor.",
    category: "prescription",
    read: false,
    createdAt: daysAgo(4),
    actionUrl: "/account/prescriptions",
  },
  {
    id: "notif-009",
    title: "Health Alert: Flu Season",
    message: "Flu season is approaching. Keep your medicines stocked and consider getting a flu shot.",
    category: "health",
    read: true,
    createdAt: daysAgo(5),
  },
  {
    id: "notif-010",
    title: "Refer & Earn $10",
    message: "Invite friends to KeeMeds and earn $10 credit for each successful referral.",
    category: "promotion",
    read: true,
    createdAt: daysAgo(6),
  },
  {
    id: "notif-011",
    title: "Payment Received",
    message: "Payment of $45.99 received for order ORD-1001 via UPI.",
    category: "order",
    read: false,
    createdAt: daysAgo(7),
    actionUrl: "/account/orders/ORD-1001",
  },
  {
    id: "notif-012",
    title: "Health Tip: Sleep Well",
    message: "Adults need 7-9 hours of sleep. Maintain a consistent sleep schedule for better health.",
    category: "health",
    read: true,
    createdAt: daysAgo(8),
  },
  {
    id: "notif-013",
    title: "New Collection: Ayurveda",
    message: "Explore our new range of authentic Ayurvedic wellness products.",
    category: "promotion",
    read: true,
    createdAt: daysAgo(9),
  },
  {
    id: "notif-014",
    title: "Return Approved",
    message: "Your return request for order ORD-0995 has been approved. Pickup scheduled for tomorrow.",
    category: "order",
    read: true,
    createdAt: daysAgo(10),
    actionUrl: "/account/orders/ORD-0995",
  },
  {
    id: "notif-015",
    title: "Account Security Update",
    message: "Your account password was changed successfully. If this was not you, contact support.",
    category: "system",
    read: true,
    createdAt: daysAgo(12),
  },
];

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockNotificationService implements INotificationService {
  async getNotifications(category?: NotificationCategory): Promise<Notification[]> {
    await delay(150);
    let result = [...MOCK_NOTIFICATIONS];
    if (category) {
      result = result.filter((n) => n.category === category);
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getUnreadCount(): Promise<number> {
    await delay(100);
    return MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  }

  async markAsRead(id: string): Promise<void> {
    await delay(100);
    const notif = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (notif) notif.read = true;
  }

  async markAllAsRead(): Promise<void> {
    await delay(150);
    for (const notif of MOCK_NOTIFICATIONS) {
      notif.read = true;
    }
  }
}
