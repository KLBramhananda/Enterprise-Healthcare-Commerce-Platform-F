/**
 * ERPNext Catalog Service (LIVE_API mode)
 *
 * Implements ICatalogService backed by the live KeeMeds Commerce ERPNext
 * product endpoints:
 *   - GET /api/method/keemeds_commerce.api.products.list_products
 *   - GET /api/method/keemeds_commerce.api.products.get_product?item_code=...
 *
 * Only the product listing and product detail data are served from ERPNext.
 * Discovery features (brands, collections, health concerns, recommendations,
 * search suggestions, popular searches) and related/FBT fall back to the mock
 * implementation so the full catalog experience works in LIVE_API mode.
 *
 * Non-destructive by design: nothing here removes or alters the static mock —
 * the active implementation is selected via VITE_DATA_SOURCE in the factory.
 */

import { apiClient } from "@/api/client";
import { ApiError, fromAxiosError } from "@/api/errors";
import { API_ROUTES } from "@/config/api";
import type {
  BrandDetail,
  BrandFacet,
  BrandSummary,
  CatalogCategory,
  CatalogQuery,
  Collection,
  CollectionSlug,
  DiscoveryQuery,
  HealthConcern,
  PaginatedResult,
  PopularSearch,
  Product,
  ProductDetails,
  SearchQuery,
  SearchResult,
  SearchSuggestion,
} from "@/types/catalog";
import type { ErpListProductsMessage, ErpListProductsParams, ErpProductDetailMessage, ErpProductListItem } from "@/types/erpnextProduct";
import type { ICatalogService } from "./catalogService";
import { ServiceError } from "./authService";
import { MockCatalogService } from "./catalogMock";
import { itemGroupForCategory } from "./erpNextCategoryMap";
import { productDetailMapper, productListItemMapper } from "@/mappers/productMapper";

/** Timeout override preventing product requests from hanging. */
const PRODUCT_TIMEOUT = 30_000;

/**
 * ERPNext-supported sort keys for `list_products`. The backend recognizes only
 * these values; anything else is treated as undefined (default ordering).
 */
type ErpNextSortKey = "item_name" | "item_code" | "newest" | "price";

/**
 * Map a frontend `CatalogSortOption` to the ERPNext-backed sort key.
 *
 * The live API supports: `item_name`, `item_code`, `newest`, `price`.
 * Unsupported frontend sorts (rating, discount, popularity) fall back
 * gracefully rather than sending an invalid `sort_by` to ERPNext.
 */
function toErpNextSortKey(sortBy?: CatalogQuery["sortBy"]): ErpNextSortKey | undefined {
  switch (sortBy) {
    case "price_asc":
    case "price_desc":
      return "price";
    case "name_asc":
      return "item_name";
    case "popularity":
    case "discount":
    case "rating":
    default:
      // No direct ERPNext equivalent → fall back to the default/newest ordering.
      return undefined;
  }
}

/**
 * Mapper used to build the list query from the frontend CatalogQuery model.
 * Translates the domain filter/sort contract into the API params contract.
 *
 * Only valid, ERPNext-supported parameters are ever set. Categories that have
 * no ERPNext Item Group (e.g. medicines, wellness) omit `item_group` entirely
 * so the whole section is returned.
 */
function toListParams(query: CatalogQuery): ErpListProductsParams {
  const params: ErpListProductsParams = {
    page: query.page ?? 1,
    page_size: query.pageSize ?? 12,
  };

  // Forward only a backend-supported sort key; unsupported sorts are omitted
  // and handled locally by applySort.
  const sortKey = toErpNextSortKey(query.sortBy);
  if (sortKey) params.sort_by = sortKey;

  // Resolve the frontend category slug to a valid ERPNext Item Group. When
  // the slug has no ERPNext equivalent (e.g. "medicines", "wellness") the
  // mapper returns undefined and we omit item_group rather than sending an
  // invalid value that would filter out every product.
  const itemGroup = itemGroupForCategory(query.categorySlug);
  if (itemGroup) params.item_group = itemGroup;

  const filters = query.filters;
  if (filters) {
    if (filters.brands.length > 0) params.brand = filters.brands.join(",");
    if (filters.inStockOnly) params.in_stock = true;
  }

  return params;
}

/**
 * Applies the requested sort order to a page of products.
 * The live API forwards sort_by but currently returns unsorted page content,
 * so we sort locally to guarantee correct ordering within a page. When the
 * backend implements server-side sorting this remains a harmless no-op on
 * already-sorted data.
 */
function applySort(items: Product[], sortBy: CatalogQuery["sortBy"]): Product[] {
  if (!sortBy || sortBy === "popularity") return items;
  const sorted = [...items];
  switch (sortBy) {
    case "price_asc": sorted.sort((a, b) => a.price - b.price); break;
    case "price_desc": sorted.sort((a, b) => b.price - a.price); break;
    case "discount": sorted.sort((a, b) => b.discountPercent - a.discountPercent); break;
    case "rating": sorted.sort((a, b) => b.rating - a.rating); break;
    case "name_asc": sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: break;
  }
  return sorted;
}

/**
 * Context used for every product request so errors surface with a clear
 * message and a stable category for the UI.
 */
function normalizeError(error: unknown): never {
  const apiErr = fromAxiosError(error);
  // Map 404 (product not found) to a ServiceError the detail page understands.
  if (apiErr.status === 404) {
    throw new ServiceError("Product not found.", "NOT_FOUND", 404);
  }
  throw apiErr;
}

export class ErpNextCatalogService implements ICatalogService {
  /** Mock backend for discovery + recommendations that have no live endpoint. */
  private readonly mock = new MockCatalogService();

  /* ── Categories (static, shared with mock) ── */

  getCategories(): Promise<CatalogCategory[]> {
    // Categories come from the curated static set; products are live.
    return this.mock.getCategories();
  }

  getCategory(slug: string): Promise<CatalogCategory> {
    return this.mock.getCategory(slug);
  }

  getBrandFacets(categorySlug?: string): Promise<BrandFacet[]> {
    return this.mock.getBrandFacets(categorySlug);
  }

  /* ── Live product listing ── */

  async getProducts(query: CatalogQuery = {}): Promise<PaginatedResult<Product>> {
    const params = toListParams(query);
    const response = await apiClient.get<{ message: ErpListProductsMessage }>(
      API_ROUTES.PRODUCTS.LIST,
      { params, timeout: PRODUCT_TIMEOUT },
    );

    const message = response.data?.message;
    if (!message?.data) {
      throw new ApiError({ message: "Invalid response from product API", category: "unknown" });
    }

    const data = message.data;
    const items = Array.isArray(data.items)
      ? data.items.map((dto: ErpProductListItem) => productListItemMapper.toDomain(dto))
      : [];

    const pagination = data.pagination ?? {};
    const total = Number(pagination.total_records ?? items.length);
    const page = Number(pagination.page ?? query.page ?? 1);
    const pageSize = Number(pagination.page_size ?? query.pageSize ?? 12);
    const totalPages = Number(pagination.total_pages ?? Math.max(1, Math.ceil(total / pageSize)));

    // The live API currently returns items unsorted; apply the requested sort
    // over the current page so ordering is correct when the backend sorts too.
    const sorted = applySort(items, query.sortBy);

    return { items: sorted, total, page, pageSize, totalPages };
  }

  /* ── Live product detail ── */

  async getProductDetails(id: string): Promise<ProductDetails> {
    try {
      const response = await apiClient.get<{ message: ErpProductDetailMessage }>(
        API_ROUTES.PRODUCTS.GET,
        { params: { item_code: id }, timeout: PRODUCT_TIMEOUT },
      );
      const detail = response.data?.message?.data;
      if (!detail) {
        throw new ServiceError("Product not found.", "NOT_FOUND", 404);
      }
      return productDetailMapper.toDomain(detail);
    } catch (error) {
      return normalizeError(error);
    }
  }

  /* ── Related / FBT (mock fallback) ── */

  getRelatedProducts(id: string): Promise<Product[]> {
    return this.mock.getRelatedProducts(id);
  }

  getFrequentlyBoughtTogether(id: string): Promise<Product[]> {
    return this.mock.getFrequentlyBoughtTogether(id);
  }

  /* ── Search (mock fallback over the live catalog is not available yet) ── */

  getSearchSuggestions(q: string): Promise<SearchSuggestion[]> {
    return this.mock.getSearchSuggestions(q);
  }

  searchProducts(query: SearchQuery): Promise<SearchResult> {
    return this.mock.searchProducts(query);
  }

  getPopularSearches(): Promise<PopularSearch[]> {
    return this.mock.getPopularSearches();
  }

  getHealthConcerns(): Promise<HealthConcern[]> {
    return this.mock.getHealthConcerns();
  }

  /* ── Discovery: Brands ── */

  getBrands(): Promise<BrandSummary[]> {
    return this.mock.getBrands();
  }

  getBrandBySlug(slug: string): Promise<BrandDetail> {
    return this.mock.getBrandBySlug(slug);
  }

  getBrandProducts(slug: string, query?: DiscoveryQuery): Promise<PaginatedResult<Product>> {
    return this.mock.getBrandProducts(slug, query);
  }

  /* ── Discovery: Collections ── */

  getCollections(): Promise<Collection[]> {
    return this.mock.getCollections();
  }

  getCollectionBySlug(slug: string): Promise<Collection> {
    return this.mock.getCollectionBySlug(slug);
  }

  getCollectionProducts(slug: CollectionSlug, query?: DiscoveryQuery): Promise<PaginatedResult<Product>> {
    return this.mock.getCollectionProducts(slug, query);
  }

  /* ── Discovery: Health Concerns ── */

  getHealthConcernBySlug(slug: string): Promise<HealthConcern> {
    return this.mock.getHealthConcernBySlug(slug);
  }

  getHealthConcernProducts(slug: string, query?: DiscoveryQuery): Promise<PaginatedResult<Product>> {
    return this.mock.getHealthConcernProducts(slug, query);
  }

  /* ── Discovery: Recommendations ── */

  getBestSellers(limit = 12): Promise<Product[]> {
    return this.mock.getBestSellers(limit);
  }

  getTrending(limit = 12): Promise<Product[]> {
    return this.mock.getTrending(limit);
  }

  getNewArrivals(limit = 12): Promise<Product[]> {
    return this.mock.getNewArrivals(limit);
  }

  getSimilarProducts(id: string, limit = 8): Promise<Product[]> {
    return this.mock.getSimilarProducts(id, limit);
  }

  getRecentlyViewedProductIds(): Promise<string[]> {
    return this.mock.getRecentlyViewedProductIds();
  }

  getProductsByIds(ids: string[]): Promise<Product[]> {
    return this.mock.getProductsByIds(ids);
  }
}
