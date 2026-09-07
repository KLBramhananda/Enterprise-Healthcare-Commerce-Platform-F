/**
 * ERPNext Product API Types
 *
 * DTOs matching the actual KeeMeds Commerce ERPNext product endpoints:
 *   - GET /api/method/keemeds_commerce.api.products.list_products
 *   - GET /api/method/keemeds_commerce.api.products.get_product?item_code=...
 *
 * Verified response contract (September 2026):
 *
 *   list_products →
 *     { message: { success, message,
 *                  data: { items: ErpProductListItem[],
 *                          pagination: { page, page_size, total_records, total_pages } } } }
 *
 *   get_product → { message: { success, message, data: ErpProductDetail } }
 *
 * Field names intentionally use the snake_case of the live API.
 */

/* ── Query parameters sent to list_products ── */

/** Supported sort keys for the live API. */
export type ErpProductSort =
  | "item_name"
  | "item_code"
  | "newest"
  | "price";

/** Centralized query contract for the live product listing endpoint. */
export interface ErpListProductsParams {
  /** Page number (1-based). */
  page?: number;
  /** Items per page. */
  page_size?: number;
  /** Free text search across name/brand/manufacturer. */
  search?: string;
  /** Filter by a single exact brand name. The backend matches brands verbatim. */
  brand?: string;
  /** Filter by a single exact manufacturer name. */
  manufacturer?: string;
  /** Filter by a single exact Item Group name. List products live under one
   *  Item Group per category, so item_group is always a single exact value. */
  item_group?: string;
  /** Only include products that are in stock. */
  in_stock?: boolean;
  /** Sort key. The backend parameter is `sort` (NOT `sort_by`). */
  sort?: ErpProductSort;
}

/* ── Product images ── */

/** Image reference returned by the API. */
export interface ErpProductImages {
  primary_image?: string | null;
  gallery?: string[] | null;
}

/* ── Product list item DTO ── */

/** A single product as returned by list_products. */
export interface ErpProductListItem {
  item_code: string;
  item_name: string;
  brand?: string | null;
  manufacturer?: string | null;
  item_group: string;
  strength?: string | null;
  dosage_form?: string | null;
  salt_composition?: string | null;
  selling_price: number;
  currency?: string | null;
  in_stock: boolean;
  available_qty?: number | null;
  images?: ErpProductImages | null;
}

/* ── Paginated listing envelope ── */

/** Pagination metadata returned by list_products. */
export interface ErpListPagination {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
}

/** The `data` payload of a list_products response. */
export interface ErpListProductsData {
  items: ErpProductListItem[];
  pagination: ErpListPagination;
}

/** Outer `message` payload of a list_products response. */
export interface ErpListProductsMessage {
  success: boolean;
  message: string;
  data: ErpListProductsData;
}

/* ── Product detail DTO ── */

/** A single product as returned by get_product (includes list fields + extras). */
export interface ErpProductDetail extends ErpProductListItem {
  description?: string | null;
  country_of_origin?: string | null;
}

/** Outer `message` payload of a get_product response. */
export interface ErpProductDetailMessage {
  success: boolean;
  message: string;
  data: ErpProductDetail;
}
