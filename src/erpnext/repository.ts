/**
 * ERPNext Base Repository Classes
 *
 * Reusable base classes and utilities that eliminate duplicated logic
 * across all ERPNext repository implementations. Future module repositories
 * (Products, Categories, Orders, Healthcare, etc.) extend these bases
 * instead of implementing common patterns from scratch.
 *
 * Architecture:
 *   Component → Hook → Service Interface → Repository Interface → (Mock | ERPNext)
 *                                                                  ↑
 *                                                    ErpNextBaseRepository (this module)
 *
 * The base classes provide:
 *   - Standard CRUD operations via Frappe REST/RPC
 *   - Paginated list retrieval with filter/sort support
 *   - Automatic DTO → domain mapping via Mapper pattern
 *   - ApiResponse envelope wrapping
 *   - Consistent error handling
 */

import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Mapper } from "@/mappers/types";
import type { FrappeDoc, ERPNextFilterParam, ERPNextSortParam } from "./types";
import { toFilterTuple, toOrderByString } from "./types";
import { rpcCall, getCount } from "./request";
import { ok, okPaginated, extractAudit, extractErrorMessage } from "./response";
import type { AuditMeta } from "./types";
import { computePaginationMeta, type PaginationState } from "./pagination";
import { ApiError } from "@/api/errors";

/* ── Base repository ── */

/**
 * Abstract base class for all ERPNext repositories.
 * Provides common CRUD operations and response formatting.
 *
 * @param TDomain - Frontend domain model type
 * @param TDto - ERPNext DTO (Frappe DocType shape)
 * @param TCreate - Payload for creating a new document
 * @param TUpdate - Payload for updating an existing document
 */
export abstract class ErpNextBaseRepository<
  TDomain,
  TDto extends FrappeDoc,
  TCreate = Partial<TDto>,
  TUpdate = Partial<TDto>,
> {
  abstract readonly name: string;

  /**
   * The Frappe DocType name (e.g. "Item", "Sales Order").
   * Subclasses must define this.
   */
  abstract readonly doctype: string;

  /**
   * The mapper for converting between DTO and domain model.
   * Subclasses must provide this.
   */
  abstract readonly mapper: Mapper<TDto, TDomain>;

  /* ── Read operations ── */

  /**
   * Fetch a single document by name and map to domain model.
   */
  async getByName(name: string): Promise<TDomain> {
    try {
      const dto = await rpcCall<TDto>("frappe.client.get", {
        doctype: this.doctype,
        name,
      });
      return this.mapper.toDomain(dto);
    } catch (error) {
      throw new ApiError({
        message: extractErrorMessage(error, `Failed to fetch ${this.doctype} "${name}"`),
        category: "notFound",
        status: 404,
        cause: error,
      });
    }
  }

  /**
   * Fetch a single document wrapped in an ApiResponse envelope.
   */
  async getByNameAsApiResponse(name: string): Promise<ApiResponse<TDomain>> {
    const domain = await this.getByName(name);
    return ok(domain);
  }

  /**
   * Fetch a list of documents with pagination, filters, and sorting.
   */
  async getList(params?: {
    filters?: ERPNextFilterParam[];
    orderBy?: ERPNextSortParam;
    fields?: string[];
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<TDomain>> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const limitStart = (page - 1) * pageSize;

    const rpcArgs: Record<string, unknown> = {
      doctype: this.doctype,
      limit_start: limitStart,
      limit_page_length: pageSize,
    };

    if (params?.filters && params.filters.length > 0) {
      rpcArgs.filters = params.filters.map(toFilterTuple);
    }
    if (params?.orderBy) {
      rpcArgs.order_by = toOrderByString(params.orderBy);
    }
    if (params?.fields && params.fields.length > 0) {
      rpcArgs.fields = params.fields;
    }

    try {
      const [items, total] = await Promise.all([
        rpcCall<TDto[]>("frappe.client.get_list", rpcArgs),
        getCount(this.doctype, params?.filters),
      ]);

      const domains = items.map((dto) => this.mapper.toDomain(dto));
      return okPaginated(domains, total, page, pageSize);
    } catch (error) {
      throw new ApiError({
        message: extractErrorMessage(error, `Failed to fetch ${this.doctype} list`),
        category: "unknown",
        cause: error,
      });
    }
  }

  /* ── Create operation ── */

  /**
   * Create a new document and return the mapped domain model.
   */
  async create(data: TCreate): Promise<TDomain> {
    try {
      const dto = await rpcCall<TDto>("frappe.client.insert", {
        doctype: this.doctype,
        doc: data,
      });
      return this.mapper.toDomain(dto);
    } catch (error) {
      throw new ApiError({
        message: extractErrorMessage(error, `Failed to create ${this.doctype}`),
        category: "badRequest",
        status: 400,
        cause: error,
      });
    }
  }

  /**
   * Create a new document wrapped in an ApiResponse.
   */
  async createAsApiResponse(data: TCreate): Promise<ApiResponse<TDomain>> {
    const domain = await this.create(data);
    return ok(domain, `${this.doctype} created`);
  }

  /* ── Update operations ── */

  /**
   * Fully update a document (PUT equivalent).
   */
  async update(name: string, data: TUpdate): Promise<TDomain> {
    try {
      const dto = await rpcCall<TDto>("frappe.client.save", {
        doc: { doctype: this.doctype, name, ...data },
      });
      return this.mapper.toDomain(dto);
    } catch (error) {
      throw new ApiError({
        message: extractErrorMessage(error, `Failed to update ${this.doctype} "${name}"`),
        category: "badRequest",
        status: 400,
        cause: error,
      });
    }
  }

  /**
   * Partially update a document (PATCH equivalent — set specific fields).
   */
  async patch(name: string, data: Record<string, unknown>): Promise<TDomain> {
    try {
      const dto = await rpcCall<TDto>("frappe.client.set_value", {
        doctype: this.doctype,
        name,
        fieldname: data,
      });
      return this.mapper.toDomain(dto);
    } catch (error) {
      throw new ApiError({
        message: extractErrorMessage(error, `Failed to patch ${this.doctype} "${name}"`),
        category: "badRequest",
        status: 400,
        cause: error,
      });
    }
  }

  /**
   * Update a document wrapped in an ApiResponse.
   */
  async updateAsApiResponse(name: string, data: TUpdate): Promise<ApiResponse<TDomain>> {
    const domain = await this.update(name, data);
    return ok(domain, `${this.doctype} updated`);
  }

  /* ── Delete operation ── */

  /**
   * Delete a document by name.
   */
  async remove(name: string): Promise<void> {
    try {
      await rpcCall("frappe.client.delete", {
        doctype: this.doctype,
        name,
      });
    } catch (error) {
      throw new ApiError({
        message: extractErrorMessage(error, `Failed to delete ${this.doctype} "${name}"`),
        category: "badRequest",
        status: 400,
        cause: error,
      });
    }
  }

  /**
   * Delete a document wrapped in an ApiResponse.
   */
  async removeAsApiResponse(name: string): Promise<ApiResponse<void>> {
    await this.remove(name);
    return ok(undefined as void, `${this.doctype} deleted`);
  }

  /* ── Utility methods ── */

  /**
   * Extract audit metadata from a Frappe document.
   */
  protected audit(doc: FrappeDoc): AuditMeta {
    return extractAudit(doc as unknown as Record<string, unknown>);
  }

  /**
   * Compute pagination state from list params.
   */
  protected paginate(total: number, page: number, pageSize: number): PaginationState & { meta: ReturnType<typeof computePaginationMeta> } {
    const state: PaginationState = { page, pageSize, totalRecords: total };
    return { ...state, meta: computePaginationMeta(state) };
  }
}

/* ── Lightweight base for stub repositories ── */

/**
 * Minimal base for repositories that are not yet fully implemented.
 * Provides the `name` field and a standard not-implemented error.
 */
export class ErpNextStubRepository {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  protected notImplemented(method: string): never {
    throw new ApiError({
      message: `${this.name}.${method} is not yet implemented`,
      category: "unknown",
      status: 501,
    });
  }
}
