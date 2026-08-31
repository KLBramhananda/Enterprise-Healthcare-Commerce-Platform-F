/**
 * Mapper Infrastructure
 *
 * DTO (Data Transfer Object) mappers translate between API response shapes
 * (snake_case, Frappe/ERPNext conventions) and frontend domain models
 * (camelCase, clean types). This keeps components and services decoupled
 * from backend serialization formats.
 *
 * Pattern:
 *   - Each mapper implements `Mapper<TDto, TDomain>` with `toDomain(dto)` and optionally `toDto(domain)`.
 *   - Mappers are pure functions — no side effects, fully testable.
 *   - When ERPNext is connected, DTO mappers transform Frappe responses before
 *     they reach the service layer.
 *
 * Example ERPNext → Frontend mapping:
 *   ERPNext Product DocType (snake_case, nested fields)
 *     → ProductMapper.toDomain(erpnextProduct)
 *       → Product (camelCase, frontend shape)
 */

/* ── Generic mapper contract ── */

export interface Mapper<TDto, TDomain> {
  /** Transform an API DTO into a frontend domain model. */
  toDomain(dto: TDto): TDomain;
  /** Transform a frontend domain model back into an API DTO (for writes). */
  toDto?(domain: TDomain): TDto;
}

/** Batch transform an array of DTOs. */
export function mapAll<TDto, TDomain>(
  mapper: Mapper<TDto, TDomain>,
  dtos: TDto[],
): TDomain[] {
  return dtos.map((dto) => mapper.toDomain(dto));
}

/** Transform an ApiResponse envelope, mapping only the inner data. */
export function mapResponse<TDto, TDomain>(
  mapper: Mapper<TDto, TDomain>,
  response: import("@/types/api").ApiResponse<TDto>,
): import("@/types/api").ApiResponse<TDomain> {
  return {
    ...response,
    data: mapper.toDomain(response.data),
  };
}

/** Transform a PaginatedResponse, mapping only the items array. */
export function mapPaginatedResponse<TDto, TDomain>(
  mapper: Mapper<TDto, TDomain>,
  response: import("@/types/api").PaginatedResponse<TDto>,
): import("@/types/api").PaginatedResponse<TDomain> {
  return {
    ...response,
    data: {
      ...response.data,
      items: response.data.items.map((item) => mapper.toDomain(item)),
    },
  };
}
