/**
 * ERPNext Mutation Helpers
 *
 * Reusable React Query mutation hooks for CRUD and bulk operations.
 * These provide standardized error handling, optimistic update patterns,
 * and cache invalidation for ERPNext-backed entities.
 *
 * Usage in repository modules:
 *   export function useCreateItem() {
 *     return useErpNextCreate<CreateItemPayload, Item>("Item", erpItemKeys);
 *   }
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { insertDoc, updateDoc, patchDoc, deleteDoc, bulkInsert } from "./request";
import type { ApiError } from "@/api/errors";

/* ── Types ── */

/** Generic key factory interface matching the erpQueryKeys pattern. */
export interface ModuleQueryKeys {
  all: readonly unknown[];
  list: (filters?: Record<string, unknown>) => readonly unknown[];
  detail: (id: string) => readonly unknown[];
}

/** Options for create mutations. */
export interface CreateMutationOptions<TData, TVariables> {
  /** Called after successful creation. Receives the created document. */
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** Called on error. */
  onError?: (error: ApiError) => void;
  /** Additional query key patterns to invalidate beyond the module's `all` key. */
  extraInvalidations?: readonly unknown[][];
}

/** Options for update mutations. */
export interface UpdateMutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiError) => void;
  extraInvalidations?: readonly unknown[][];
}

/** Options for delete mutations. */
export interface DeleteMutationOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
  extraInvalidations?: readonly unknown[][];
}

/* ── Create mutation ── */

/**
 * Create a reusable mutation for inserting a new ERPNext document.
 *
 * @param doctype - The Frappe DocType name
 * @param keys - The module's query key factory
 * @param options - Optional callbacks
 */
export function useErpNextCreate<TVariables extends Record<string, unknown>, TData>(
  doctype: string,
  keys: ModuleQueryKeys,
  options?: CreateMutationOptions<TData, TVariables>,
): UseMutationResult<TData, ApiError, TVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) => insertDoc<TData>(doctype, variables),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      if (options?.extraInvalidations) {
        for (const key of options.extraInvalidations) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
      options?.onSuccess?.(data, variables);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

/* ── Update mutation ── */

/**
 * Create a reusable mutation for updating an ERPNext document (full replace).
 *
 * @param doctype - The Frappe DocType name
 * @param keys - The module's query key factory
 * @param options - Optional callbacks
 */
export function useErpNextUpdate<TVariables extends Record<string, unknown>, TData>(
  doctype: string,
  keys: ModuleQueryKeys,
  options?: UpdateMutationOptions<TData>,
): UseMutationResult<TData, ApiError, { name: string; data: TVariables }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, data }) => updateDoc<TData>(doctype, name, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: keys.detail(variables.name) });
      if (options?.extraInvalidations) {
        for (const key of options.extraInvalidations) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
      options?.onSuccess?.(_data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

/* ── Patch mutation ── */

/**
 * Create a reusable mutation for partially updating an ERPNext document.
 */
export function useErpNextPatch<TVariables extends Record<string, unknown>, TData>(
  doctype: string,
  keys: ModuleQueryKeys,
  options?: UpdateMutationOptions<TData>,
): UseMutationResult<TData, ApiError, { name: string; data: TVariables }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, data }) => patchDoc<TData>(doctype, name, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: keys.detail(variables.name) });
      options?.extraInvalidations?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      );
      options?.onSuccess?.(_data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

/* ── Delete mutation ── */

/**
 * Create a reusable mutation for deleting an ERPNext document.
 */
export function useErpNextDelete(
  doctype: string,
  keys: ModuleQueryKeys,
  options?: DeleteMutationOptions,
): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name) => deleteDoc(doctype, name),
    onSuccess: (_data, name) => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.removeQueries({ queryKey: keys.detail(name) });
      options?.extraInvalidations?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      );
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

/* ── Bulk insert mutation ── */

/**
 * Create a reusable mutation for bulk-inserting ERPNext documents.
 */
export function useErpNextBulkCreate<TVariables extends Record<string, unknown>, TData>(
  doctype: string,
  keys: ModuleQueryKeys,
  options?: CreateMutationOptions<TData[], TVariables[]>,
): UseMutationResult<TData[], ApiError, TVariables[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) => bulkInsert<TData>(doctype, variables),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      options?.extraInvalidations?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      );
      options?.onSuccess?.(data, variables);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
