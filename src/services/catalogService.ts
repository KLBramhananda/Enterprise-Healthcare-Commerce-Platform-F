/**
 * Catalog Service Interface
 *
 * Defines the contract for all product catalog operations.
 * The UI layer depends ONLY on this interface — never on a concrete implementation.
 * To integrate with ERPNext, implement ICatalogService and swap the export in services/index.ts.
 */

import type {
  BrandDetail,
  BrandFacet,
  BrandSummary,
  CatalogCategory,
  CatalogQuery,
  Collection,
  CollectionSlug,
  DiscoveryQuery,
  PaginatedResult,
  Product,
  ProductDetails,
  SearchQuery,
  SearchResult,
  SearchSuggestion,
  PopularSearch,
  HealthConcern,
} from "@/types/catalog";

export interface ICatalogService {
  /** All browsable categories with display metadata. */
  getCategories(): Promise<CatalogCategory[]>;

  /**
   * A single category by slug.
   * Throws a ServiceError with code "NOT_FOUND" when the slug is unknown.
   */
  getCategory(slug: string): Promise<CatalogCategory>;

  /** Brand facet counts, optionally scoped to one category. */
  getBrandFacets(categorySlug?: string): Promise<BrandFacet[]>;

  /**
   * Filtered, sorted, paginated products for a catalog query.
   * Mirrors the future server-side API contract.
   */
  getProducts(query?: CatalogQuery): Promise<PaginatedResult<Product>>;

  /**
   * Enriched product details for the product detail page.
   * Throws a ServiceError with code "NOT_FOUND" when the id is unknown.
   */
  getProductDetails(id: string): Promise<ProductDetails>;

  /**
   * Related products from the same category, excluding the source product.
   */
  getRelatedProducts(id: string): Promise<Product[]>;

  /**
   * Frequently bought together suggestions for a given product.
   */
  getFrequentlyBoughtTogether(id: string): Promise<Product[]>;

  /** Instant search suggestions for a query prefix. */
  getSearchSuggestions(q: string): Promise<SearchSuggestion[]>;

  /** Full text search with filtering, sorting, and pagination. */
  searchProducts(query: SearchQuery): Promise<SearchResult>;

  /** Trending/popular search terms. */
  getPopularSearches(): Promise<PopularSearch[]>;

  /** Health concern topics for search landing. */
  getHealthConcerns(): Promise<HealthConcern[]>;

  /* ── Discovery: Brands ── */

  /** All brands with summary info. */
  getBrands(): Promise<BrandSummary[]>;

  /** Full brand details by slug. */
  getBrandBySlug(slug: string): Promise<BrandDetail>;

  /** Products for a brand, optionally sorted/paginated. */
  getBrandProducts(slug: string, query?: DiscoveryQuery): Promise<PaginatedResult<Product>>;

  /* ── Discovery: Collections ── */

  /** All collections. */
  getCollections(): Promise<Collection[]>;

  /** Collection metadata by slug. */
  getCollectionBySlug(slug: string): Promise<Collection>;

  /** Products in a collection, optionally sorted/paginated. */
  getCollectionProducts(slug: CollectionSlug, query?: DiscoveryQuery): Promise<PaginatedResult<Product>>;

  /* ── Discovery: Health Concerns ── */

  /** Health concern details by slug. */
  getHealthConcernBySlug(slug: string): Promise<HealthConcern>;

  /** Products related to a health concern. */
  getHealthConcernProducts(slug: string, query?: DiscoveryQuery): Promise<PaginatedResult<Product>>;

  /* ── Discovery: Recommendations ── */

  /** Best-selling products across all categories. */
  getBestSellers(limit?: number): Promise<Product[]>;

  /** Currently trending products. */
  getTrending(limit?: number): Promise<Product[]>;

  /** Newly added products. */
  getNewArrivals(limit?: number): Promise<Product[]>;

  /** Products similar to a given product (by name/brand similarity). */
  getSimilarProducts(id: string, limit?: number): Promise<Product[]>;

  /** Products the user recently viewed (from localStorage). */
  getRecentlyViewedProductIds(): Promise<string[]>;

  /** Retrieve product details for a list of IDs. */
  getProductsByIds(ids: string[]): Promise<Product[]>;
}
