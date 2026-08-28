/**
 * Account Domain Types
 *
 * Types for notifications, account settings, order timeline,
 * return requests, prescription records, and dashboard.
 * Designed to mirror the ERPNext API contract for seamless backend swap.
 */

/* ── Notifications ── */

export type NotificationCategory = "order" | "prescription" | "promotion" | "health" | "system";

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

/* ── Account Settings ── */

export interface AccountPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  promotionalEmails: boolean;
  language: string;
}

/* ── Order Timeline ── */

export type TimelineEventType =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "return_approved"
  | "refund_processed";

export interface OrderTimelineEvent {
  type: TimelineEventType;
  label: string;
  timestamp: string;
  description?: string;
}

/* ── Return Request ── */

export type ReturnReason = "damaged" | "wrong_item" | "quality_issue" | "not_as_described" | "other";

export interface ReturnRequest {
  orderId: string;
  reason: ReturnReason;
  description: string;
  requestedAt: string;
}

/* ── Prescription Records ── */

export type PrescriptionStatus = "pending_review" | "approved" | "rejected" | "expired";

export interface PrescriptionRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
  status: PrescriptionStatus;
  doctorName?: string;
  validUntil?: string;
}

/* ── Dashboard ── */

export interface AccountCompletionStatus {
  hasProfile: boolean;
  hasAddresses: boolean;
  hasPrescriptions: boolean;
  percentage: number;
}
