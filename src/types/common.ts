/**
 * Common Types
 *
 * Shared domain types used across the application.
 */

export interface Document {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
}

export interface SelectOption {
  label: string;
  value: string;
}

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortDirection;
}
