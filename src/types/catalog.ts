/**
 * Catalog Types
 *
 * Domain types for the product catalog: categories, products,
 * filtering/sorting contracts, and paginated results.
 * Consumed by the catalog service layer and presentational components.
 *
 * The query/result shapes mirror the intended ERPNext API contract so the
 * service implementation can be swapped without UI changes.
 */

import type { LucideIcon } from "lucide-react";

/* ── Categories ── */

export interface CatalogCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: "brand" | "blue" | "green" | "purple" | "amber" | "pink" | "orange" | "cyan";
  productCount: number;
}

/* ── Products ── */

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  manufacturer: string;
  categorySlug: string;
  form: string;
  packSize: string;
  price: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  requiresPrescription: boolean;
  stockStatus: StockStatus;
  isNew?: boolean;
  isBestseller?: boolean;
  isTrending?: boolean;
  isLimitedOffer?: boolean;
}

/* ── Product Details ── */

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ProductDetails extends Product {
  description: string;
  keyBenefits: string[];
  dosage: string;
  precautions: string[];
  storage: string;
  ingredients: string;
  composition: string;
  faqs: ProductFaq[];
  images: ProductImage[];
  reviewSummary: ReviewSummary;
  estimatedDeliveryDays: number;
  returnable: boolean;
  expiryDate?: string;
}

/* ── Sorting ── */

export type CatalogSortOption =
  | "popularity"
  | "price_asc"
  | "price_desc"
  | "discount"
  | "rating"
  | "name_asc";

/* ── Filtering ── */

export type PriceRangeId = "under_5" | "5_to_10" | "10_to_25" | "above_25";

export type PrescriptionFilter = "any" | "rx_only" | "otc_only";

export interface CatalogFilters {
  brands: string[];
  priceRanges: PriceRangeId[];
  minDiscountPercent: number;
  prescription: PrescriptionFilter;
  inStockOnly: boolean;
}

export function emptyCatalogFilters(): CatalogFilters {
  return {
    brands: [],
    priceRanges: [],
    minDiscountPercent: 0,
    prescription: "any",
    inStockOnly: false,
  };
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return (
    filters.brands.length > 0 ||
    filters.priceRanges.length > 0 ||
    filters.minDiscountPercent > 0 ||
    filters.prescription !== "any" ||
    filters.inStockOnly
  );
}

/* ── Query / Result Contract ── */

/** Aggregated brand facet for filter UIs. */
export interface BrandFacet {
  name: string;
  count: number;
}

export interface CatalogQuery {
  categorySlug?: string;
  sortBy?: CatalogSortOption;
  filters?: CatalogFilters;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ── Search ── */

export interface SearchSuggestion {
  id: string;
  text: string;
  type: "product" | "category" | "brand" | "health_concern";
  /** Start/end character offsets of the matched portion within `text`. */
  highlightRanges?: [number, number][];
}

export interface CategoryFacet {
  slug: string;
  title: string;
  count: number;
}

export interface SearchQuery {
  q: string;
  sortBy?: CatalogSortOption;
  filters?: CatalogFilters;
  page?: number;
  pageSize?: number;
}

export interface SearchResult extends PaginatedResult<Product> {
  query: string;
  categoryFacets: CategoryFacet[];
}

export interface PopularSearch {
  text: string;
  count: number;
}

export interface HealthConcern {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  relatedCategorySlugs: string[];
  keywords: string[];
}

/* ── Product Badges ── */

export type ProductBadgeType = "new" | "bestseller" | "trending" | "prescription" | "limited_offer";

export interface ProductBadge {
  type: ProductBadgeType;
  label: string;
}

export function getProductBadges(product: Product): ProductBadge[] {
  const badges: ProductBadge[] = [];
  if (product.isNew) badges.push({ type: "new", label: "New" });
  if (product.isBestseller) badges.push({ type: "bestseller", label: "Bestseller" });
  if (product.isTrending) badges.push({ type: "trending", label: "Trending" });
  if (product.isLimitedOffer) badges.push({ type: "limited_offer", label: "Limited Offer" });
  if (product.requiresPrescription) badges.push({ type: "prescription", label: "Rx Required" });
  return badges;
}

/* ── Brands (Commerce-level) ── */

export interface BrandDetail {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logoColor: string;
  productCount: number;
  categorySlugs: string[];
}

/* ── Collections ── */

export type CollectionSlug =
  | "best-sellers"
  | "trending"
  | "new-arrivals"
  | "deals-of-the-day"
  | "essentials"
  | "staff-picks";

export interface Collection {
  id: string;
  slug: CollectionSlug;
  title: string;
  description: string;
  accent: "brand" | "blue" | "purple" | "amber" | "pink" | "green";
  productCount: number;
}

/* ── Discovery Queries ── */

export type DiscoverySortOption = "popularity" | "rating" | "price_asc" | "price_desc" | "newest";

export interface DiscoveryQuery {
  brandSlug?: string;
  collectionSlug?: CollectionSlug;
  concernSlug?: string;
  sortBy?: DiscoverySortOption;
  page?: number;
  pageSize?: number;
}

export interface BrandSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logoColor: string;
  productCount: number;
}
