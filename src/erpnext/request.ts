/**
 * ERPNext Request Helpers
 *
 * Reusable, typed HTTP request functions built on the shared apiClient.
 * Every ERPNext repository should use these helpers instead of calling
 * apiClient directly, ensuring consistent error handling, response
 * parsing, and Frappe conventions.
 *
 * Convention:
 *   - RPC calls go through /api/method/<method_path>
 *   - REST calls go through /api/resource/<DocType>[/<name>]
 *   - All helpers return the parsed `message` or `data` payload
 *   - Errors are normalized to ApiError via the apiClient interceptor
 */

import { apiClient } from "@/api/client";
import type {
  ERPNextListParams,
  ERPNextSortParam,
  ERPNextFilterParam,
  ERPNextRpcParams,
  ErpNextFileUpload,
  ErpNextFileResponse,
} from "./types";
import { toFilterTuple, toOrderByString } from "./types";

/* ── RPC helpers (via /api/method) ── */

/**
 * Call a Frappe RPC method and return the `message` payload.
 *
 * @param method - Fully-qualified method path (e.g. "frappe.client.get_list")
 * @param args - Arguments to pass to the RPC method
 * @returns The `message` field from the RPC response
 */
export async function rpcCall<T>(method: string, args?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.post<{ message: T }>(method, args ?? {});
  return response.data.message;
}

/**
 * Execute a Frappe RPC call described by an ERPNextRpcParams object.
 */
export async function rpc<T>(params: ERPNextRpcParams): Promise<T> {
  return rpcCall<T>(params.method, params.args);
}

/* ── REST helpers (via /api/resource) ── */

/**
 * Fetch a single Frappe document by name.
 *
 * @param doctype - DocType name (e.g. "Item", "Customer")
 * @param name - Document name (primary key)
 * @returns The document data
 */
export async function getDoc<T>(doctype: string, name: string): Promise<T> {
  const response = await apiClient.get<T>(`/api/resource/${doctype}/${encodeURIComponent(name)}`);
  return response.data;
}

/**
 * Fetch a list of Frappe documents using Frappe's get_list RPC.
 *
 * @param doctype - DocType name
 * @param params - List parameters (pagination, filters, sort, fields)
 * @returns Array of matching documents
 */
export async function getList<T>(doctype: string, params?: Partial<ERPNextListParams>): Promise<T[]> {
  const args: Record<string, unknown> = {
    doctype,
    limit_start: params?.limitStart ?? 0,
    limit_page_length: params?.limitPageLength ?? 20,
  };

  if (params?.filters && params.filters.length > 0) {
    args.filters = params.filters.map(toFilterTuple);
  }
  if (params?.orderBy) {
    args.order_by = toOrderByString(params.orderBy);
  }
  if (params?.fields && params.fields.length > 0) {
    args.fields = params.fields;
  }

  return rpcCall<T[]>("frappe.client.get_list", args);
}

/**
 * Count documents matching optional filters.
 *
 * @param doctype - DocType name
 * @param filters - Optional filter array
 * @returns Total count of matching documents
 */
export async function getCount(
  doctype: string,
  filters?: ERPNextFilterParam[],
): Promise<number> {
  const args: Record<string, unknown> = { doctype };
  if (filters && filters.length > 0) {
    args.filters = filters.map(toFilterTuple);
  }
  return rpcCall<number>("frappe.client.count", args);
}

/**
 * Get a value of a specific field from a document.
 */
export async function getValue<T>(
  doctype: string,
  name: string,
  fieldname: string,
): Promise<T> {
  const response = await apiClient.get<{ message: T }>(
    `/api/method/frappe.client.get_value`,
    { params: { doctype, filters: { name }, fieldname } },
  );
  return response.data.message;
}

/**
 * Insert a new Frappe document.
 */
export async function insertDoc<T>(doctype: string, data: Record<string, unknown>): Promise<T> {
  const response = await apiClient.post<T>(`/api/resource/${doctype}`, data);
  return response.data;
}

/**
 * Update an existing Frappe document (PUT = full replace).
 */
export async function updateDoc<T>(
  doctype: string,
  name: string,
  data: Record<string, unknown>,
): Promise<T> {
  const response = await apiClient.put<T>(
    `/api/resource/${doctype}/${encodeURIComponent(name)}`,
    data,
  );
  return response.data;
}

/**
 * Partially update a Frappe document (PATCH).
 */
export async function patchDoc<T>(
  doctype: string,
  name: string,
  data: Record<string, unknown>,
): Promise<T> {
  const response = await apiClient.patch<T>(
    `/api/resource/${doctype}/${encodeURIComponent(name)}`,
    data,
  );
  return response.data;
}

/**
 * Delete a Frappe document.
 */
export async function deleteDoc(doctype: string, name: string): Promise<void> {
  await apiClient.delete(`/api/resource/${doctype}/${encodeURIComponent(name)}`);
}

/* ── Batch / bulk helpers ── */

/**
 * Insert multiple documents in a single RPC call.
 */
export async function bulkInsert<T>(
  doctype: string,
  docs: Array<Record<string, unknown>>,
): Promise<T[]> {
  return rpcCall<T[]>("frappe.client.insert_many", {
    docs: docs.map((d) => ({ doctype, ...d })),
  });
}

/**
 * Set a field value on multiple documents matching a filter.
 */
export async function bulkSetValues(
  doctype: string,
  filters: ERPNextFilterParam[],
  value: Record<string, unknown>,
): Promise<void> {
  await rpcCall("frappe.client.set_value", {
    doctype,
    filters: filters.map(toFilterTuple),
    value,
  });
}

/* ── File upload ── */

/**
 * Upload a file to ERPNext (attaches to a doc if doctype/docname provided).
 * Returns the file response with URL and metadata.
 */
export async function uploadFile(upload: ErpNextFileUpload): Promise<ErpNextFileResponse> {
  const formData = new FormData();
  formData.append("file", upload.file);
  formData.append("is_private", upload.isPrivate ? "1" : "0");

  if (upload.doctype) formData.append("doctype", upload.doctype);
  if (upload.docname) formData.append("docname", upload.docname);
  if (upload.fieldName) formData.append("field_name", upload.fieldName);

  const response = await apiClient.post<ErpNextFileResponse>(
    "/api/method/upload_file",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

/* ── Sort helpers ── */

/**
 * Build Frappe orderBy string from a sort param.
 * Convenience wrapper for use in repository methods.
 */
export function buildOrderBy(sort?: ERPNextSortParam): string | undefined {
  return sort ? toOrderByString(sort) : undefined;
}
