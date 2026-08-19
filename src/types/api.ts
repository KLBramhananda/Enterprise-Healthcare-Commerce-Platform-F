/**
 * API Response Types
 *
 * Shared types for all backend API communication.
 * The backend uses a consistent { success, message, data } envelope.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

export type ExistsResponse = ApiResponse<{ exists: boolean }>;

export interface ListParams {
  search?: string;
  limit_start: number;
  limit_page_length: number;
}
