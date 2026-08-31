/**
 * ERPNext Permission Helpers
 *
 * Reusable utilities for checking and managing ERPNext role-based
 * permissions. These helpers can consume ERPNext role and permission
 * data to provide authorization decisions at the frontend level.
 *
 * ERPNext permission model:
 *   - Roles: Users are assigned roles (e.g. "System Manager", "Customer")
 *   - Permissions: DocType-level CRUD permissions per role
 *   - Level-based: Permissions can be field-level (0 = doc, 1+ = child)
 *   - User permissions: Document-specific access restrictions
 *
 * This module provides:
 *   - Role checking helpers
 *   - Permission level assessment
 *   - UI visibility gate functions
 *   - Caching for role data
 */

/* ── Types ── */

/** A Frappe role assigned to a user. */
export interface ErpNextRole {
  role: string;
}

/** ERPNext permission record for a DocType. */
export interface ErpNextPermission {
  doctype: string;
  role: string;
  read: number;
  write: number;
  create: number;
  delete: number;
  submit: number;
  cancel: number;
  amend: number;
  report: number;
  export: number;
  import: number;
  print: number;
  email: number;
  share: number;
  level: number;
}

/** A user's effective permissions across all DocTypes. */
export interface UserPermissionContext {
  roles: string[];
  permissions: ErpNextPermission[];
}

/* ── Role checking ── */

/**
 * Check if a user has a specific role.
 */
export function hasRole(context: UserPermissionContext, role: string): boolean {
  return context.roles.includes(role);
}

/**
 * Check if a user has any of the specified roles.
 */
export function hasAnyRole(
  context: UserPermissionContext,
  roles: string[],
): boolean {
  return roles.some((role) => context.roles.includes(role));
}

/**
 * Check if a user has all of the specified roles.
 */
export function hasAllRoles(
  context: UserPermissionContext,
  roles: string[],
): boolean {
  return roles.every((role) => context.roles.includes(role));
}

/* ── Permission checking ── */

/** Permission action types. */
export type PermissionAction =
  | "read"
  | "write"
  | "create"
  | "delete"
  | "submit"
  | "cancel"
  | "amend"
  | "report"
  | "export"
  | "import"
  | "print"
  | "email"
  | "share";

/**
 * Check if a user has a specific permission on a DocType.
 *
 * @param context - The user's permission context
 * @param doctype - The DocType to check
 * @param action - The action to check (read, write, create, etc.)
 */
export function canPerform(
  context: UserPermissionContext,
  doctype: string,
  action: PermissionAction,
): boolean {
  return context.permissions.some(
    (perm) => perm.doctype === doctype && perm[action] === 1,
  );
}

/**
 * Check if a user can read a specific DocType.
 */
export function canRead(
  context: UserPermissionContext,
  doctype: string,
): boolean {
  return canPerform(context, doctype, "read");
}

/**
 * Check if a user can create documents of a specific DocType.
 */
export function canCreate(
  context: UserPermissionContext,
  doctype: string,
): boolean {
  return canPerform(context, doctype, "create");
}

/**
 * Check if a user can edit a specific DocType.
 */
export function canWrite(
  context: UserPermissionContext,
  doctype: string,
): boolean {
  return canPerform(context, doctype, "write");
}

/**
 * Check if a user can delete documents of a specific DocType.
 */
export function canDelete(
  context: UserPermissionContext,
  doctype: string,
): boolean {
  return canPerform(context, doctype, "delete");
}

/**
 * Get all permissions a user has on a specific DocType.
 */
export function getDocTypePermissions(
  context: UserPermissionContext,
  doctype: string,
): ErpNextPermission[] {
  return context.permissions.filter((perm) => perm.doctype === doctype);
}

/* ── Common role presets ── */

/** Standard ERPNext/KeeMeds role names. */
export const ERP_ROLES = {
  SYSTEM_MANAGER: "System Manager",
  CUSTOMER: "Customer",
  PHARMACIST: "Pharmacist",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  LAB_TECHNICIAN: "Lab Technician",
  SALES_MANAGER: "Sales Manager",
  SUPPORT_AGENT: "Support Agent",
  INVENTORY_MANAGER: "Inventory Manager",
  PURCHASE_MANAGER: "Purchase Manager",
  ADMINISTRATOR: "Administrator",
} as const;

/**
 * Check if the user is an administrator.
 */
export function isAdministrator(context: UserPermissionContext): boolean {
  return hasRole(context, ERP_ROLES.ADMINISTRATOR);
}

/**
 * Check if the user is a system manager.
 */
export function isSystemManager(context: UserPermissionContext): boolean {
  return hasRole(context, ERP_ROLES.SYSTEM_MANAGER);
}

/**
 * Check if the user is a healthcare professional.
 */
export function isHealthcareProfessional(context: UserPermissionContext): boolean {
  return hasAnyRole(context, [
    ERP_ROLES.DOCTOR,
    ERP_ROLES.NURSE,
    ERP_ROLES.PHARMACIST,
    ERP_ROLES.LAB_TECHNICIAN,
  ]);
}

/* ── UI visibility helpers ── */

/** Determine UI visibility based on permission. */
export type UiVisibility = "visible" | "hidden" | "disabled";

/**
 * Map a permission check to UI visibility.
 * Returns "visible" if allowed, "disabled" if not allowed but the element
 * should still be shown (for tooltips), or "hidden" if the element should
 * not render at all.
 */
export function getVisibility(
  context: UserPermissionContext,
  doctype: string,
  action: PermissionAction,
  fallback: UiVisibility = "hidden",
): UiVisibility {
  return canPerform(context, doctype, action) ? "visible" : fallback;
}

/* ── Permission context factory ── */

/** Create an empty permission context (for guests / unauthenticated). */
export function createEmptyPermissionContext(): UserPermissionContext {
  return { roles: [], permissions: [] };
}

/**
 * Merge multiple permission contexts (e.g. from different role assignments).
 */
export function mergePermissionContexts(
  ...contexts: UserPermissionContext[]
): UserPermissionContext {
  const roles = [...new Set(contexts.flatMap((c) => c.roles))];
  const permissions = [...new Set(contexts.flatMap((c) => c.permissions))];
  return { roles, permissions };
}
