/**
 * ERPNext Shared Types
 *
 * Reusable types for all ERPNext/Frappe integrations. These mirror Frappe
 * conventions (snake_case, specific field names) and provide the foundation
 * for every ERP module repository.
 *
 * Design rules:
 *   - Always extend FrappeDoc for any DocType-based entity
 *   - Use ERPNextListParams for paginated list endpoints
 *   - Use ERPNextSortParam / ERPNextFilterParam for query building
 */

import type { SortDirection } from "@/types/common";

/* ── Base Frappe document ── */

/** Core fields present on every Frappe DocType record. */
export interface FrappeDoc {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: 0 | 1 | 2;
  idx?: number;
  parent?: string;
  parentfield?: string;
  parenttype?: string;
}

/* ── Audit metadata (camelCase for frontend consumption) ── */

/** Audit fields mapped from FrappeDoc for frontend domain models. */
export interface AuditMeta {
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  modifiedBy: string;
}

/* ── Request parameters ── */

/** Standard Frappe list query parameters. */
export interface ERPNextListParams {
  /** Zero-based offset (Frappe limit_start). */
  limitStart: number;
  /** Page size (Frappe limit_page_length). */
  limitPageLength: number;
  /** Text search filter. */
  filters?: ERPNextFilterParam[];
  /** Sort specification. */
  orderBy?: ERPNextSortParam;
  /** Fields to select (empty = all). */
  fields?: string[];
}

/** Single sort clause for Frappe orderBy. */
export interface ERPNextSortParam {
  field: string;
  direction: SortDirection;
}

/**
 * Frappe filter tuple format.
 * Frappe accepts filters as: [["field", "operator", value], ...]
 */
export type ERPNextFilterTuple = [string, string, unknown];

/**
 * Flexible filter representation.
 * Accepts either the Frappe tuple format or an object notation.
 */
export type ERPNextFilterParam = ERPNextFilterTuple | { field: string; operator: string; value: unknown };

/** Convert a ERPNextFilterParam to Frappe tuple format. */
export function toFilterTuple(filter: ERPNextFilterParam): ERPNextFilterTuple {
  if (Array.isArray(filter)) return filter;
  return [filter.field, filter.operator, filter.value];
}

/** Convert sort param to Frappe orderBy string (e.g. "creation desc"). */
export function toOrderByString(sort: ERPNextSortParam): string {
  return `${sort.field} ${sort.direction}`;
}

/* ── Frappe RPC call params ── */

/** Parameters for a Frappe RPC call via /api/method. */
export interface ERPNextRpcParams {
  /** Fully-qualified method path (e.g. "frappe.client.get_list"). */
  method: string;
  /** Arguments passed to the RPC method. */
  args?: Record<string, unknown>;
}

/* ── ERPNext DocType identifiers ── */

/** Common Frappe/ERPNext DocType names used across modules. */
export const ERP_DOCTYPES = {
  USER: "User",
  CUSTOMER: "Customer",
  ITEM: "Item",
  ITEM_GROUP: "Item Group",
  ORDER: "Sales Order",
  QUOTATION: "Quotation",
  DELIVERY_NOTE: "Delivery Note",
  SALES_INVOICE: "Sales Invoice",
  ADDRESS: "Address",
  CONTACT: "Contact",
  MEDIA: "File",
  NOTE: "Note",
  COMMENT: "Comment",
  ATTACHMENT: "File",
  ROLE: "Role",
  HAS_ROLE: "Has Role",
} as const;

export type ErpDoctype = (typeof ERP_DOCTYPES)[keyof typeof ERP_DOCTYPES];

/* ── Permission types ── */

/** Permission level for an ERPNext operation. */
export type PermissionLevel = "read" | "write" | "create" | "delete" | "submit" | "cancel" | "amend";

/** Permission check result for a single doctype. */
export interface PermissionCheck {
  doctype: string;
  permission: PermissionLevel;
  allowed: boolean;
}

/* ── File upload types ── */

/** Metadata for a file being uploaded to ERPNext. */
export interface ErpNextFileUpload {
  /** The File object to upload. */
  file: File;
  /** The DocType this file is attached to. */
  doctype?: string;
  /** The document name this file is attached to. */
  docname?: string;
  /** Field name on the parent DocType. */
  fieldName?: string;
  /** Whether this is a private file (requires auth to access). */
  isPrivate?: boolean;
}

/** Response from an ERPNext file upload. */
export interface ErpNextFileResponse {
  name: string;
  file_name: string;
  file_url: string;
  file_size: number;
  is_private: number;
  attached_to_doctype?: string;
  attached_to_name?: string;
  creation: string;
}

/* ── Attachment download types ── */

/** An attachment reference for download. */
export interface AttachmentRef {
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}
