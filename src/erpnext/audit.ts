/**
 * ERPNext Audit Metadata
 *
 * Reusable mapping and display utilities for Frappe audit fields.
 * Every Frappe DocType carries standard audit metadata (creation,
 * owner, modified, modified_by) that maps to frontend domain models.
 *
 * Features:
 *   - Extract audit metadata from any Frappe document
 *   - Format audit timestamps for display
 *   - Compare modification times
 *   - Generate "last updated" human-readable strings
 */

import type { FrappeDoc, AuditMeta } from "./types";

/* ── Extraction ── */

/**
 * Extract audit metadata from a raw Frappe document.
 * Handles both full FrappeDoc and partial objects.
 */
export function extractAuditMeta(doc: Partial<FrappeDoc>): AuditMeta {
  return {
    createdAt: doc.creation ?? "",
    createdBy: doc.owner ?? "",
    modifiedAt: doc.modified ?? "",
    modifiedBy: doc.modified_by ?? "",
  };
}

/**
 * Extract audit metadata from a plain record (when the full FrappeDoc
 * type is not available).
 */
export function extractAuditFromRecord(doc: Record<string, unknown>): AuditMeta {
  return {
    createdAt: String(doc.creation ?? ""),
    createdBy: String(doc.owner ?? ""),
    modifiedAt: String(doc.modified ?? ""),
    modifiedBy: String(doc.modified_by ?? ""),
  };
}

/* ── Formatting ── */

/**
 * Format a Frappe timestamp for display.
 * Frappe timestamps are in "YYYY-MM-DD HH:mm:ss.SSSSSS" format.
 *
 * @param timestamp - Frappe creation/modified timestamp
 * @param options - Intl.DateTimeFormat options
 */
export function formatAuditTimestamp(
  timestamp: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!timestamp) return "—";

  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "—";

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    };

    return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
  } catch {
    return "—";
  }
}

/**
 * Format a timestamp as a relative time string (e.g. "2 hours ago").
 */
export function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return "—";

  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "—";

    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return formatAuditTimestamp(timestamp, {
      hour: undefined,
      minute: undefined,
    });
  } catch {
    return "—";
  }
}

/**
 * Format a Frappe user identifier for display.
 * Frappe user identifiers are typically email addresses or "Administrator".
 */
export function formatUserDisplay(userId: string): string {
  if (!userId) return "—";
  // Extract name part from email
  if (userId.includes("@")) {
    return userId.split("@")[0];
  }
  return userId;
}

/* ── Comparison ── */

/**
 * Compare two audit timestamps.
 * Returns 1 if a > b, -1 if a < b, 0 if equal.
 */
export function compareTimestamps(a: string, b: string): number {
  const dateA = new Date(a).getTime();
  const dateB = new Date(b).getTime();
  if (dateA > dateB) return 1;
  if (dateA < dateB) return -1;
  return 0;
}

/**
 * Check if a document was modified after a given timestamp.
 */
export function wasModifiedAfter(doc: AuditMeta, timestamp: string): boolean {
  if (!doc.modifiedAt || !timestamp) return false;
  return new Date(doc.modifiedAt).getTime() > new Date(timestamp).getTime();
}

/**
 * Get the time elapsed since the document was last modified.
 * Returns milliseconds, or null if modification time is unavailable.
 */
export function timeSinceModified(doc: AuditMeta): number | null {
  if (!doc.modifiedAt) return null;
  const modified = new Date(doc.modifiedAt).getTime();
  if (Number.isNaN(modified)) return null;
  return Date.now() - modified;
}

/* ── Display helpers for common patterns ── */

/**
 * Generate a "last updated by <user> on <date>" string.
 */
export function lastUpdatedSummary(doc: AuditMeta): string {
  if (!doc.modifiedAt) return "No update information";
  const user = formatUserDisplay(doc.modifiedBy);
  const date = formatAuditTimestamp(doc.modifiedAt);
  return `Last updated by ${user} on ${date}`;
}

/**
 * Generate a "created by <user> on <date>" string.
 */
export function createdSummary(doc: AuditMeta): string {
  if (!doc.createdAt) return "No creation information";
  const user = formatUserDisplay(doc.createdBy);
  const date = formatAuditTimestamp(doc.createdAt);
  return `Created by ${user} on ${date}`;
}
