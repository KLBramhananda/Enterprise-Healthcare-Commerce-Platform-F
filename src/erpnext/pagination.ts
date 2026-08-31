/**
 * ERPNext Pagination Models
 *
 * Reusable pagination state, computation, and URL serialization for
 * consistent pagination across all ERPNext-backed modules.
 *
 * Supports:
 *   - Page-number based pagination (default)
 *   - Offset-based pagination (Frappe native)
 *   - Total pages computation
 *   - Page range generation for UI pagination controls
 *   - URL search param serialization/deserialization
 */

/* ── Core pagination state ── */

/** Canonical pagination state used across all paginated views. */
export interface PaginationState {
  /** Current page number (1-based). */
  page: number;
  /** Number of items per page. */
  pageSize: number;
  /** Total number of records matching the query. */
  totalRecords: number;
}

/** Computed pagination metadata derived from a PaginationState. */
export interface PaginationMeta {
  /** Total number of pages (always >= 1). */
  totalPages: number;
  /** Zero-based offset for the first item on the current page. */
  offset: number;
  /** Whether there is a next page. */
  hasNextPage: boolean;
  /** Whether there is a previous page. */
  hasPreviousPage: boolean;
  /** Index of the first item on the current page (0-based). */
  firstItemIndex: number;
  /** Index of the last item on the current page (0-based). */
  lastItemIndex: number;
  /** Whether pagination is needed at all. */
  needsPagination: boolean;
}

/* ── Computation helpers ── */

/**
 * Compute derived pagination metadata from a PaginationState.
 */
export function computePaginationMeta(state: PaginationState): PaginationMeta {
  const { page, pageSize, totalRecords } = state;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const offset = (page - 1) * pageSize;
  const firstItemIndex = totalRecords > 0 ? offset : 0;
  const lastItemIndex = Math.min(offset + pageSize - 1, totalRecords - 1);

  return {
    totalPages,
    offset,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    firstItemIndex,
    lastItemIndex,
    needsPagination: totalRecords > pageSize,
  };
}

/**
 * Clamp a page number to valid bounds [1, totalPages].
 */
export function clampPage(page: number, totalPages: number): number {
  return Math.max(1, Math.min(page, Math.max(1, totalPages)));
}

/* ── Frappe list params conversion ── */

/** Convert a PaginationState to Frappe list params. */
export function toFrappeListParams(state: PaginationState): {
  limit_start: number;
  limit_page_length: number;
} {
  return {
    limit_start: (state.page - 1) * state.pageSize,
    limit_page_length: state.pageSize,
  };
}

/** Create a PaginationState from a Frappe list response. */
export function fromFrappeListResponse(
  total: number,
  limitStart: number,
  limitPageLength: number,
): PaginationState {
  const page = Math.floor(limitStart / limitPageLength) + 1;
  return {
    page,
    pageSize: limitPageLength,
    totalRecords: total,
  };
}

/* ── URL search param serialization ── */

const DEFAULT_PAGE_SIZE = 20;

/** Serialize pagination state to URL search params. */
export function paginationToSearchParams(state: PaginationState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.page > 1) params.set("page", String(state.page));
  if (state.pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(state.pageSize));
  return params;
}

/** Deserialize pagination state from URL search params. */
export function paginationFromSearchParams(
  params: URLSearchParams | Record<string, string>,
): Partial<PaginationState> {
  const sp = params instanceof URLSearchParams ? params : new URLSearchParams(params);
  const result: Partial<PaginationState> = {};
  const page = sp.get("page");
  const pageSize = sp.get("pageSize");
  if (page) result.page = Math.max(1, Number(page) || 1);
  if (pageSize) result.pageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  return result;
}

/* ── Page range for UI ── */

/** A single page number or ellipsis in a pagination range. */
export type PageRangeItem = number | "...";

/**
 * Generate a page range for pagination UI.
 * Shows first page, last page, current page, and up to `siblingCount`
 * pages on each side of the current page.
 *
 * @param currentPage - Current active page (1-based)
 * @param totalPages - Total number of pages
 * @param siblingCount - Number of pages to show on each side of current (default: 1)
 */
export function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PageRangeItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages: PageRangeItem[] = [1];

  if (showLeftEllipsis) {
    pages.push("...");
  } else {
    for (let i = 2; i < leftSibling; i++) pages.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push("...");
  } else {
    for (let i = rightSibling + 1; i < totalPages; i++) pages.push(i);
  }

  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

/* ── Default state factory ── */

/** Create a default PaginationState with sensible defaults. */
export function createPagination(overrides?: Partial<PaginationState>): PaginationState {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalRecords: 0,
    ...overrides,
  };
}
