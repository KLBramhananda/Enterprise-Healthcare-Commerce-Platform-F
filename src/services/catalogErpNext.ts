/**
 * ERPNext Catalog Service (LIVE_API mode)
 *
 * Implements ICatalogService backed entirely by the live KeeMeds Commerce
 * ERPNext product endpoints:
 *   - GET /api/method/keemeds_commerce.api.products.list_products
 *   - GET /api/method/keemeds_commerce.api.products.get_product?item_code=...
 *
 * Phase 13A — catalog filter synchronization. The MockCatalogService is NOT
 * used anywhere in this service anymore:
 *   - Every category resolves through erpNextCategoryMap to exactly ONE
 *     ERPNext Item Group. A category with no Item Group on the backend
 *     (wellness, lab-tests, health-devices, personal-care, nutrition) yields
 *     an EMPTY result set — it never falls back to the whole catalog.
 *   - The brand facet dropdown is derived from the products actually returned
 *     by the current category, never from a hardcoded brand list.
 *   - The `sort` parameter (not `sort_by`) is sent to the backend. Sorts the
 *     backend supports (item_name / price / newest) stay server-side. Sorts
 *     with no backend equivalent (price_desc, rating, discount) are resolved
 *     over the complete filtered dataset and paginated locally, so ordering
 *     is globally correct across pages (never a page-local reversal).
 *   - Single-brand / single-manufacturer filters are sent to the backend as
 *     exact values. Multi-select brands/manufacturers cannot be expressed by
 *     the backend (one exact value per request) and are therefore resolved
 *     over the full (memoized) dataset with client-side pagination.
 *   - Price facets, minimum discount, and prescription requirement have no
 *     backend parameters either; they are applied client-side over the full
 *     dataset. Pagination uses the backend page/page_size envelope on the
 *     server path and local slicing on the local path.
 *
 * Curated UI metadata (categories, collections, health concerns, popular
 * searches, brand taglines/colors) is content configuration only — every
 * product object and its counts come from live requests.
 */

import { apiClient } from "@/api/client";
import { ApiError, fromAxiosError } from "@/api/errors";
import { API_ROUTES } from "@/config/api";
import type {
  BrandDetail,
  BrandFacet,
  BrandSummary,
  CatalogCategory,
  CatalogFilters,
  CatalogQuery,
  CatalogSortOption,
  CategoryFacet,
  Collection,
  CollectionSlug,
  DiscoveryQuery,
  DiscoverySortOption,
  HealthConcern,
  ManufacturerFacet,
  PaginatedResult,
  PopularSearch,
  PriceRangeId,
  Product,
  ProductDetails,
  SearchQuery,
  SearchResult,
  SearchSuggestion,
} from "@/types/catalog";
import { emptyCatalogFilters, priceRangeBounds } from "@/types/catalog";
import type { ErpListProductsMessage, ErpListProductsParams, ErpProductDetail, ErpProductDetailMessage, ErpProductListItem } from "@/types/erpnextProduct";
import type { ICatalogService } from "./catalogService";
import { ServiceError } from "./authService";
import { itemGroupForCategory } from "./erpNextCategoryMap";
import { productDetailMapper, productListItemMapper } from "@/mappers/productMapper";
import {
  Apple,
  Droplets,
  Flower2,
  Heart,
  Leaf,
  Pill,
  ShieldCheck,
  Stethoscope,
  TestTube,
  Thermometer,
  User,
} from "lucide-react";

/** Timeout override preventing product requests from hanging. */
const PRODUCT_TIMEOUT = 30_000;

/** The live API caps page_size at 100 items. */
const MAX_ITEMS_PER_REQUEST = 100;

/** Safety cap for full-catalog aggregations. */
const MAX_CATALOG_ITEMS = 1_000;

/** ERPNext-supported sort keys for `list_products` (backend param `sort`). */
type ErpNextSortKey = "item_name" | "item_code" | "newest" | "price";

/**
 * Map a `CatalogSortOption` to the ERPNext sort key.
 *
 * Backend-supported: item_name, item_code, newest, price (ascending only).
 * Sorts with no backend equivalent (rating, discount) return `undefined` so
 * the default item_name ordering is requested and the page is ordered
 * locally by the service.
 */
function toErpNextSortKey(sortBy?: CatalogSortOption): ErpNextSortKey | undefined {
  switch (sortBy) {
    case "popularity":
    case "name_asc":
      return "item_name";
    case "price_asc":
    case "price_desc":
      return "price";
    case "rating":
    case "discount":
    default:
      return undefined;
  }
}

/** Same mapping for the discovery subset of sort options. */
function toDiscoverySortKey(sortBy?: DiscoverySortOption): ErpNextSortKey | undefined {
  switch (sortBy) {
    case "popularity":
      return "item_name";
    case "price_asc":
    case "price_desc":
      return "price";
    case "rating":
    case "newest":
    default:
      return undefined;
  }
}

/**
 * Client-side ordering over a COMPLETE filtered set. Used when the backend
 * cannot express the requested sort (price_desc, rating, discount). Ordering
 * the whole set before pagination keeps the sort globally correct across
 * pages — a page-local sort/reverse would break ordering once results span
 * more than one page.
 */
function orderFullSet(items: Product[], sortBy?: CatalogSortOption): Product[] {
  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name);
  switch (sortBy) {
    case "price_asc":
      return [...items].sort((a, b) => a.price - b.price || byName(a, b));
    case "price_desc":
      return [...items].sort((a, b) => b.price - a.price || byName(a, b));
    case "rating":
      return [...items].sort((a, b) => b.rating - a.rating || byName(a, b));
    case "discount":
      return [...items].sort((a, b) => b.discountPercent - a.discountPercent || byName(a, b));
    default:
      // popularity / name_asc match the backend's default item_name ordering.
      return [...items].sort(byName);
  }
}

/** Client-side ordering over a complete discovery set (brand/collection/concern). */
function orderDiscoveryLocal(items: Product[], sortBy: "price_desc" | "rating"): Product[] {
  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name);
  if (sortBy === "price_desc") {
    return [...items].sort((a, b) => b.price - a.price || byName(a, b));
  }
  return [...items].sort((a, b) => b.rating - a.rating || byName(a, b));
}

/**
 * Client-side filter application over a fully mapped set. Backend params can
 * express a single brand, a single manufacturer, one Item Group, in-stock,
 * and free-text search — everything else (multi-select brand/manufacturer,
 * price facets, minimum discount, prescription requirement) is applied here.
 */
function applyFiltersLocal(products: Product[], filters: CatalogFilters): Product[] {
  const brands = new Set(filters.brands.map((b) => b.trim().toLowerCase()).filter(Boolean));
  const manufacturers = new Set(
    filters.manufacturers.map((m) => m.trim().toLowerCase()).filter(Boolean),
  );
  const minDiscount = filters.minDiscountPercent ?? 0;
  const rx = filters.prescription ?? "any";
  const inStockOnly = filters.inStockOnly ?? false;

  return products.filter((product) => {
    if (brands.size > 0 && !brands.has(product.brandName.trim().toLowerCase())) return false;
    if (manufacturers.size > 0 && !manufacturers.has(product.manufacturer.trim().toLowerCase()))
      return false;
    if (inStockOnly && product.stockStatus === "out_of_stock") return false;
    if (
      filters.priceRanges.length > 0 &&
      !filters.priceRanges.some((rangeId) => priceInRange(product.price, rangeId))
    )
      return false;
    if (minDiscount > 0 && product.discountPercent < minDiscount) return false;
    if (rx === "rx_only" && !product.requiresPrescription) return false;
    if (rx === "otc_only" && product.requiresPrescription) return false;
    return true;
  });
}

/** Match a price against one price-range filter id (exclusive upper bound). */
function priceInRange(price: number, rangeId: PriceRangeId): boolean {
  const { min, max } = priceRangeBounds(rangeId);
  return price >= min && (max === undefined || price < max);
}

/**
 * Client-side pagination over an already-ordered set. Used when the backend
 * cannot express the requested filter/sort (multi-select brand/manufacturer,
 * price/discount/prescription filters, price_desc/rating/discount sorts).
 */
function paginateLocal(items: Product[], page: number, pageSize: number): PaginatedResult<Product> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page: safePage, pageSize, totalPages };
}

/** Empty result for a category that has no ERPNext Item Group. */
function emptyResult(page = 1, pageSize = 12): PaginatedResult<Product> {
  return { items: [], total: 0, page, pageSize, totalPages: 0 };
}

/** Deterministic slug for a brand name ("Sun Pharma" → "sun-pharma"). */
function slugifyBrand(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Stable hash-based accent color for brand logos. */
function brandColor(name: string): string {
  const palette = ["#2563eb", "#059669", "#dc2626", "#7c3aed", "#f59e0b", "#0284c7", "#db2777", "#65a30d"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

/** Character offset ranges of matched terms inside `text` for highlighting. */
function highlightRanges(text: string, terms: string[]): [number, number][] | undefined {
  const lower = text.toLowerCase();
  const ranges: [number, number][] = [];
  for (const term of terms) {
    const start = lower.indexOf(term);
    if (start >= 0) ranges.push([start, start + term.length]);
  }
  return ranges.length > 0 ? (ranges.sort((a, b) => a[0] - b[0]) as [number, number][]) : undefined;
}

/** Context used for request errors so they surface with a clear message. */
function normalizeError(error: unknown): never {
  const apiErr = fromAxiosError(error);
  if (apiErr.status === 404) {
    throw new ServiceError("Product not found.", "NOT_FOUND", 404);
  }
  throw apiErr;
}

/**
 * Curated navigation categories. This is UI/navigation configuration — its
 * content is static, but `productCount` is computed from live backend data.
 */
const NAV_CATEGORIES: ReadonlyArray<Omit<CatalogCategory, "productCount">> = [
  { id: "cat-medicines", slug: "medicines", title: "Medicines", description: "Prescription and over-the-counter medicines across all major therapeutic areas.", icon: Pill, color: "blue" },
  { id: "cat-wellness", slug: "wellness", title: "Wellness", description: "Vitamins, supplements, and daily essentials to keep you at your best.", icon: Leaf, color: "green" },
  { id: "cat-lab-tests", slug: "lab-tests", title: "Lab Tests", description: "Preventive health checkups and diagnostic panels from certified labs.", icon: TestTube, color: "purple" },
  { id: "cat-devices", slug: "health-devices", title: "Health Devices", description: "Monitors, thermometers, nebulizers, and home-care medical devices.", icon: Stethoscope, color: "amber" },
  { id: "cat-personal-care", slug: "personal-care", title: "Personal Care", description: "Skin, hair, oral, and feminine hygiene care for the whole family.", icon: User, color: "pink" },
  { id: "cat-nutrition", slug: "nutrition", title: "Nutrition", description: "Proteins, nutrition drinks, and dietary supplements for every age.", icon: Apple, color: "orange" },
  { id: "cat-ayurveda", slug: "ayurveda", title: "Ayurveda", description: "Classical and proprietary ayurvedic formulations from trusted houses.", icon: Flower2, color: "brand" },
  { id: "cat-homeopathy", slug: "homeopathy", title: "Homeopathy", description: "Dilutions, biochemics, and mother tins for gentle homeopathic care.", icon: Droplets, color: "cyan" },
];

const CATEGORY_TITLES: Readonly<Record<string, string>> = Object.fromEntries(
  NAV_CATEGORIES.map((cat) => [cat.slug, cat.title]),
);

/**
 * Curated collections. The catalog data they resolve to is alive: in the
 * live mode every collection shows the newest products from the backend.
 */
const COLLECTIONS: ReadonlyArray<{ id: string; slug: CollectionSlug; title: string; description: string; accent: Collection["accent"] }> = [
  { id: "col-best-sellers", slug: "best-sellers", title: "Best Sellers", description: "Our most popular products loved by thousands of customers", accent: "brand" },
  { id: "col-trending", slug: "trending", title: "Trending Now", description: "Products that are gaining momentum this week", accent: "blue" },
  { id: "col-new-arrivals", slug: "new-arrivals", title: "New Arrivals", description: "Freshly added products to our catalog", accent: "purple" },
  { id: "col-deals-of-the-day", slug: "deals-of-the-day", title: "Deals of the Day", description: "Limited-time offers on top products", accent: "amber" },
  { id: "col-essentials", slug: "essentials", title: "Health Essentials", description: "Must-have products for your everyday healthcare needs", accent: "green" },
  { id: "col-staff-picks", slug: "staff-picks", title: "Staff Picks", description: "Handpicked recommendations from our healthcare experts", accent: "pink" },
];

/** Curated health concern topics for search landing + concern pages. */
const HEALTH_CONCERNS: ReadonlyArray<Omit<HealthConcern, "icon"> & { iconKey: string }> = [
  { slug: "fever-pain", name: "Fever & Pain", description: "Relief for headaches, body aches, and fevers", iconKey: "thermometer", relatedCategorySlugs: ["medicines"], keywords: ["fever", "pain", "headache", "ache", "paracetamol", "ibuprofen"] },
  { slug: "diabetes", name: "Diabetes Care", description: "Blood sugar monitoring and management", iconKey: "droplets", relatedCategorySlugs: ["medicines"], keywords: ["diabetes", "blood sugar", "glucose", "metformin", "glucometer"] },
  { slug: "heart-health", name: "Heart Health", description: "Cardiovascular and blood pressure support", iconKey: "heart", relatedCategorySlugs: ["medicines"], keywords: ["heart", "blood pressure", "cholesterol", "amlodipine", "atorvastatin", "losartan"] },
  { slug: "allergy-cold", name: "Allergy & Cold", description: "Relief from allergies, cold, and cough", iconKey: "shield", relatedCategorySlugs: ["medicines"], keywords: ["allergy", "cold", "cough", "cetirizine", "azithromycin", "sneezing", "asthma"] },
  { slug: "digestive-health", name: "Digestive Health", description: "Gut health and acid reflux solutions", iconKey: "apple", relatedCategorySlugs: ["medicines"], keywords: ["stomach", "acid", "digestion", "pantoprazole", "nausea", "vomit"] },
  { slug: "immunity", name: "Immunity", description: "Boost your natural defenses", iconKey: "leaf", relatedCategorySlugs: ["ayurveda"], keywords: ["immunity", "vitamin", "ashwagandha", "giloy", "chyawanprash", "omega", "fish oil"] },
];

const CONCERN_ICONS: Readonly<Record<string, typeof Heart>> = {
  thermometer: Thermometer,
  droplets: Droplets,
  heart: Heart,
  shield: ShieldCheck,
  apple: Apple,
  leaf: Leaf,
};

/** Curated trending search terms (search suggestion configuration). */
const POPULAR_SEARCHES: ReadonlyArray<{ text: string; count: number }> = [
  { text: "Paracetamol", count: 1200 },
  { text: "Vitamin D3", count: 980 },
  { text: "Omeprazole", count: 640 },
  { text: "Cough syrup", count: 510 },
  { text: "Blood pressure", count: 430 },
  { text: "Dolo", count: 390 },
];

export class ErpNextCatalogService implements ICatalogService {
  /** Memoized full-catalog item cache used for facets/brands/counts. */
  private allItemsPromise: Promise<ErpProductListItem[]> | null = null;

  /**
   * Memoized search datasets keyed by `${q}|${item_group}`. Reused across
   * pages, sort orders, and client-side filter combinations so a search with
   * local filters/sorts performs exactly one backend request.
   */
  private searchDatasetCache = new Map<string, Promise<ErpProductListItem[]>>();

  /**
   * Memoized discovery sets (brand/collection/concern) for client-side
   * price_desc/rating ordering. Keyed by the request params (brand/item_group).
   */
  private discoveryDatasetCache = new Map<string, Promise<Product[]>>();

  /* ── Internal helpers ── */

  /** GET list_products and normalize the envelope into the paged message. */
  private async requestPage(params: ErpListProductsParams): Promise<{ message: ErpListProductsMessage }> {
    const response = await apiClient.get<{ message: ErpListProductsMessage }>(API_ROUTES.PRODUCTS.LIST, {
      params: { ...params, page_size: Math.min(params.page_size ?? 12, MAX_ITEMS_PER_REQUEST) },
      timeout: PRODUCT_TIMEOUT,
    });
    const message = response.data?.message;
    if (!message?.data) {
      throw new ApiError({ message: "Invalid response from product API", category: "unknown" });
    }
    return { message };
  }

  /** Fetch every item matching params, looping the backend's pagination. */
  private async fetchAll(params: ErpListProductsParams): Promise<ErpProductListItem[]> {
    const pageSize = params.page_size ?? MAX_ITEMS_PER_REQUEST;
    const items: ErpProductListItem[] = [];
    const seen = new Set<string>();
    let page = params.page ?? 1;

    for (let i = 0; i < 20; i++) {
      const { message } = await this.requestPage({ ...params, page, page_size: pageSize });
      const data = message.data;
      const batch = Array.isArray(data?.items) ? data.items : [];
      for (const item of batch) {
        if (!seen.has(item.item_code)) {
          seen.add(item.item_code);
          items.push(item);
        }
      }
      const total = Number(data?.pagination?.total_records ?? batch.length);
      page += 1;
      if (total > 0 && items.length >= total) break;
      if (items.length >= MAX_CATALOG_ITEMS || batch.length === 0) break;
    }
    return items;
  }

  /** Load the whole catalog once (memoized) for aggregation queries. */
  private ensureAllItems(): Promise<ErpProductListItem[]> {
    if (this.allItemsPromise == null) {
      this.allItemsPromise = this.fetchAll({ page: 1, page_size: MAX_ITEMS_PER_REQUEST }).catch((error) => {
        this.allItemsPromise = null;
        throw error;
      });
    }
    return this.allItemsPromise;
  }

  /** Brand aggregates derived from live catalog items (never hardcoded). */
  private async brandIndex(): Promise<Array<{ name: string; slug: string; count: number }>> {
    const items = await this.ensureAllItems();
    const counts = new Map<string, number>();
    for (const item of items) {
      const brand = (item.brand ?? "").trim();
      if (!brand) continue;
      counts.set(brand, (counts.get(brand) ?? 0) + 1);
    }
    return Array.from(counts, ([name, count]) => ({ name, slug: slugifyBrand(name), count })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
  }

  /** Resolve a brand name from its slug via the live brand index. */
  private async brandNameFromSlug(slug: string): Promise<string | undefined> {
    const index = await this.brandIndex();
    const match = index.find((entry) => entry.slug === slug);
    if (match) return match.name;
    return undefined;
  }

  /** Fetch the full (memoized per query) backend search result set. */
  private fetchSearchDataset(q: string, itemGroup?: string): Promise<ErpProductListItem[]> {
    const key = `${q}|${itemGroup ?? ""}`;
    let pending = this.searchDatasetCache.get(key);
    if (!pending) {
      pending = this.fetchAll({
        search: q,
        item_group: itemGroup,
        page: 1,
        page_size: MAX_ITEMS_PER_REQUEST,
      }).catch((error) => {
        this.searchDatasetCache.delete(key);
        throw error;
      });
      this.searchDatasetCache.set(key, pending);
    }
    return pending;
  }

  /** Fetch a whole discovery set (memoized) for local price_desc/rating ordering. */
  private discoverSet(params: ErpListProductsParams): Promise<Product[]> {
    const key = JSON.stringify({ ...params, page: undefined, page_size: undefined });
    let pending = this.discoveryDatasetCache.get(key);
    if (!pending) {
      pending = this.fetchAll({ ...params, page: 1, page_size: MAX_ITEMS_PER_REQUEST }).then(
        (items) => items.map((item) => productListItemMapper.toDomain(item)),
      ).catch((error) => {
        this.discoveryDatasetCache.delete(key);
        throw error;
      });
      this.discoveryDatasetCache.set(key, pending);
    }
    return pending;
  }

  /* ── Categories (curated navigation; live product counts) ── */

  async getCategories(): Promise<CatalogCategory[]> {
    const items = await this.ensureAllItems();
    return NAV_CATEGORIES.map((cat) => {
      const group = itemGroupForCategory(cat.slug);
      const productCount = group
        ? items.filter((item) => item.item_group?.trim().toLowerCase() === group.toLowerCase()).length
        : 0;
      return { ...cat, productCount };
    });
  }

  async getCategory(slug: string): Promise<CatalogCategory> {
    const cat = NAV_CATEGORIES.find((c) => c.slug === slug);
    if (!cat) throw new ServiceError("Category not found.", "NOT_FOUND", 404);
    const group = itemGroupForCategory(slug);
    let productCount = 0;
    if (group) {
      const items = await this.ensureAllItems();
      productCount = items.filter((item) => item.item_group?.trim().toLowerCase() === group.toLowerCase()).length;
    }
    return { ...cat, productCount };
  }

  /* ── Brand facets (derived from the current category's products) ── */

  async getBrandFacets(categorySlug?: string): Promise<BrandFacet[]> {
    const items = await this.ensureAllItems();
    const group = categorySlug ? itemGroupForCategory(categorySlug) : undefined;
    const counts = new Map<string, number>();
    for (const item of items) {
      if (group && item.item_group?.trim().toLowerCase() !== group.toLowerCase()) continue;
      const brand = (item.brand ?? "").trim();
      if (!brand) continue;
      counts.set(brand, (counts.get(brand) ?? 0) + 1);
    }
    return Array.from(counts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
  }

  async getManufacturerFacets(categorySlug?: string): Promise<ManufacturerFacet[]> {
    const items = await this.ensureAllItems();
    const group = categorySlug ? itemGroupForCategory(categorySlug) : undefined;
    const counts = new Map<string, number>();
    for (const item of items) {
      if (group && item.item_group?.trim().toLowerCase() !== group.toLowerCase()) continue;
      const manufacturer = (item.manufacturer ?? "").trim();
      if (!manufacturer) continue;
      counts.set(manufacturer, (counts.get(manufacturer) ?? 0) + 1);
    }
    return Array.from(counts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
  }

  /* ── Live product listing with backend-driven filters/sort/pagination ── */

  async getProducts(query: CatalogQuery = {}): Promise<PaginatedResult<Product>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const filters = query.filters ?? emptyCatalogFilters();

    // Category isolation: resolve the category to exactly one ERPNext Item
    // Group. Categories without a backend Item Group are EMPTY, never "all".
    let itemGroup: string | undefined;
    if (query.categorySlug) {
      itemGroup = itemGroupForCategory(query.categorySlug);
      if (!itemGroup) return emptyResult(page, pageSize);
    }

    const sortLocally =
      query.sortBy === "price_desc" || query.sortBy === "rating" || query.sortBy === "discount";
    const needsLocal =
      filters.brands.length > 1 ||
      filters.manufacturers.length > 1 ||
      filters.priceRanges.length > 0 ||
      filters.minDiscountPercent > 0 ||
      filters.prescription !== "any" ||
      sortLocally;

    // Backend params cannot express multi-select brands/manufacturers, price
    // facets, minimum discount, prescription requirement, or the price_desc/
    // rating/discount sorts. Resolve those over the full (memoized) category
    // set and paginate locally so the filters and sort stay globally correct.
    if (needsLocal) {
      const all = await this.ensureAllItems();
      const scoped = itemGroup
        ? all.filter((item) => item.item_group?.trim().toLowerCase() === itemGroup.toLowerCase())
        : all;
      const products = scoped.map((item) => productListItemMapper.toDomain(item));
      const filtered = applyFiltersLocal(products, filters);
      return paginateLocal(orderFullSet(filtered, query.sortBy), page, pageSize);
    }

    const sortKey = toErpNextSortKey(query.sortBy);
    const { message } = await this.requestPage({
      page,
      page_size: pageSize,
      sort: sortKey,
      item_group: itemGroup,
      brand: filters.brands.length === 1 ? filters.brands[0] : undefined,
      manufacturer: filters.manufacturers.length === 1 ? filters.manufacturers[0] : undefined,
      in_stock: filters.inStockOnly || undefined,
    });

    const data = message.data;
    const items = Array.isArray(data.items)
      ? data.items.map((dto: ErpProductListItem) => productListItemMapper.toDomain(dto))
      : [];
    const total = Number(data.pagination?.total_records ?? items.length);
    const totalPages = Number(data.pagination?.total_pages ?? Math.max(1, Math.ceil(total / pageSize)));

    // The remaining sorts (popularity, name_asc, price_asc) are fully
    // expressed by the backend, so the returned page needs no reordering.
    return {
      items,
      total,
      page: Number(data.pagination?.page ?? page),
      pageSize: Number(data.pagination?.page_size ?? pageSize),
      totalPages,
    };
  }

  /* ── Live product detail ── */

  /** GET a single product and return the raw DTO. */
  private async fetchDetailDto(id: string): Promise<ErpProductDetail> {
    try {
      const response = await apiClient.get<{ message: ErpProductDetailMessage }>(API_ROUTES.PRODUCTS.GET, {
        params: { item_code: id },
        timeout: PRODUCT_TIMEOUT,
      });
      const detail = response.data?.message?.data;
      if (!detail) {
        throw new ServiceError("Product not found.", "NOT_FOUND", 404);
      }
      return detail;
    } catch (error) {
      return normalizeError(error);
    }
  }

  async getProductDetails(id: string): Promise<ProductDetails> {
    return productDetailMapper.toDomain(await this.fetchDetailDto(id));
  }

  /* ── Related / FBT / Similar (live, same Item Group) ── */

  /** All products sharing the source product's Item Group, excluding it. */
  private async sameGroupProducts(id: string): Promise<Product[]> {
    const source = await this.fetchDetailDto(id);
    const group = source?.item_group || undefined;
    const items = await this.fetchAll({
      item_group: group,
      page: 1,
      page_size: MAX_ITEMS_PER_REQUEST,
    });
    return items
      .filter((item) => item.item_code !== id)
      .map((item) => productListItemMapper.toDomain(item));
  }

  async getRelatedProducts(id: string): Promise<Product[]> {
    return (await this.sameGroupProducts(id)).slice(0, 8);
  }

  async getFrequentlyBoughtTogether(id: string): Promise<Product[]> {
    return (await this.sameGroupProducts(id)).slice(0, 3);
  }

  async getSimilarProducts(id: string, limit = 8): Promise<Product[]> {
    const products = await this.sameGroupProducts(id);
    return products
      .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
      .slice(0, limit);
  }

  /* ── Search (live via the backend `search` + `sort` params) ── */

  async getSearchSuggestions(q: string): Promise<SearchSuggestion[]> {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const terms = term.split(/\s+/);
    const suggestions: SearchSuggestion[] = [];
    const seen = new Set<string>();

    // Product suggestions — live search against the backend.
    try {
      const { message } = await this.requestPage({ search: q.trim(), page: 1, page_size: MAX_ITEMS_PER_REQUEST });
      const batch = Array.isArray(message.data?.items) ? message.data.items : [];
      for (const item of batch) {
        if (suggestions.length >= 5) break;
        const name = String(item.item_name || item.item_code);
        if (seen.has(item.item_code)) continue;
        seen.add(item.item_code);
        suggestions.push({ id: item.item_code, text: name, type: "product", highlightRanges: highlightRanges(name, terms) });
      }
    } catch {
      // suggestions simply stay empty on backend failure
    }

    // Brand suggestions — from the live brand index.
    const index = await this.brandIndex();
    if (suggestions.length < 11) {
      const seenBrands = new Set<string>();
      for (const entry of index) {
        if (suggestions.length >= 11 || seenBrands.size >= 3) break;
        const lower = entry.name.toLowerCase();
        if (!terms.some((t) => lower.includes(t)) || seenBrands.has(entry.slug)) continue;
        seenBrands.add(entry.slug);
        suggestions.push({ id: `brand-${entry.slug}`, text: entry.name, type: "brand", highlightRanges: highlightRanges(entry.name, terms) });
      }
    }

    // Category suggestions — curated navigation, title match.
    if (suggestions.length < 14) {
      const seenCats = new Set<string>();
      for (const cat of NAV_CATEGORIES) {
        if (suggestions.length >= 14 || seenCats.size >= 3) break;
        const lower = cat.title.toLowerCase();
        if (!terms.some((t) => lower.includes(t)) || seenCats.has(cat.slug)) continue;
        seenCats.add(cat.slug);
        suggestions.push({ id: cat.slug, text: cat.title, type: "category", highlightRanges: highlightRanges(cat.title, terms) });
      }
    }

    // Health concern suggestions — curated topics, keyword match.
    if (suggestions.length < 17) {
      const seenConcerns = new Set<string>();
      for (const concern of HEALTH_CONCERNS) {
        if (suggestions.length >= 17 || seenConcerns.size >= 3) break;
        const concernText = `${concern.name} ${concern.keywords.join(" ")}`.toLowerCase();
        if (!terms.some((t) => concernText.includes(t)) || seenConcerns.has(concern.slug)) continue;
        seenConcerns.add(concern.slug);
        suggestions.push({ id: `concern-${concern.slug}`, text: concern.name, type: "health_concern", highlightRanges: highlightRanges(concern.name, terms) });
      }
    }

    return suggestions;
  }

  async searchProducts(query: SearchQuery): Promise<SearchResult> {
    const q = query.q?.trim() ?? "";
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const filters = query.filters ?? emptyCatalogFilters();
    if (!q) {
      return { ...emptyResult(page, pageSize), query: "", categoryFacets: [] };
    }

    // A category-slug-scoped search resolves to that category's Item Group;
    // categories without a backend Item Group search to an empty set.
    let itemGroup: string | undefined;
    if (query.categorySlug) {
      itemGroup = itemGroupForCategory(query.categorySlug);
      if (!itemGroup) {
        return { ...emptyResult(page, pageSize), query: q, categoryFacets: [] };
      }
    }

    const sortLocally =
      query.sortBy === "price_desc" || query.sortBy === "rating" || query.sortBy === "discount";
    const needsLocal =
      filters.brands.length > 1 ||
      filters.manufacturers.length > 1 ||
      filters.priceRanges.length > 0 ||
      filters.minDiscountPercent > 0 ||
      filters.prescription !== "any" ||
      sortLocally;

    // Local path: filter/sort the full (memoized) backend search result set
    // client-side so multi-select facets, price/discount/prescription filters
    // and unsupported sorts are globally correct across pages.
    if (needsLocal) {
      const collected = await this.fetchSearchDataset(q, itemGroup);
      const products = collected.map((item) => productListItemMapper.toDomain(item));
      const filtered = applyFiltersLocal(products, filters);
      const ordered = orderFullSet(filtered, query.sortBy);
      const result = paginateLocal(ordered, page, pageSize);
      return {
        ...result,
        query: q,
        categoryFacets: this.categoryFacetsFrom(ordered),
      };
    }

    const sortKey = toErpNextSortKey(query.sortBy);
    const { message } = await this.requestPage({
      search: q,
      item_group: itemGroup,
      brand: filters.brands.length === 1 ? filters.brands[0] : undefined,
      manufacturer: filters.manufacturers.length === 1 ? filters.manufacturers[0] : undefined,
      in_stock: filters.inStockOnly || undefined,
      sort: sortKey,
      page,
      page_size: pageSize,
    });

    const data = message.data;
    const items = Array.isArray(data.items)
      ? data.items.map((dto: ErpProductListItem) => productListItemMapper.toDomain(dto))
      : [];
    const total = Number(data.pagination?.total_records ?? items.length);
    const totalPages = Number(data.pagination?.total_pages ?? Math.max(1, Math.ceil(total / pageSize)));

    return {
      items,
      total,
      page: Number(data.pagination?.page ?? page),
      pageSize: Number(data.pagination?.page_size ?? pageSize),
      totalPages,
      query: q,
      categoryFacets: this.categoryFacetsFrom(items),
    };
  }

  async getPopularSearches(): Promise<PopularSearch[]> {
    return POPULAR_SEARCHES.map((p) => ({ ...p }));
  }

  getHealthConcerns(): Promise<HealthConcern[]> {
    return Promise.resolve(HEALTH_CONCERNS.map((c) => ({ ...c, icon: CONCERN_ICONS[c.iconKey] ?? Heart })));
  }

  async getHealthConcernBySlug(slug: string): Promise<HealthConcern> {
    const concern = HEALTH_CONCERNS.find((c) => c.slug === slug);
    if (!concern) throw new ServiceError("Health concern not found.", "NOT_FOUND", 404);
    return { ...concern, icon: CONCERN_ICONS[concern.iconKey] ?? Heart };
  }

  /* ── Discovery: Brands (derived entirely from live catalog data) ── */

  async getBrands(): Promise<BrandSummary[]> {
    const index = await this.brandIndex();
    return index.map(({ name, slug, count }) => ({
      id: `brd-${slug}`,
      slug,
      name,
      tagline: `Quality healthcare products from ${name}`,
      logoColor: brandColor(name),
      productCount: count,
    }));
  }

  async getBrandBySlug(slug: string): Promise<BrandDetail> {
    const index = await this.brandIndex();
    const match = index.find((entry) => entry.slug === slug);
    if (!match) throw new ServiceError("Brand not found.", "NOT_FOUND", 404);
    return {
      id: `brd-${match.slug}`,
      slug: match.slug,
      name: match.name,
      tagline: `Quality healthcare products from ${match.name}`,
      description: `${match.name} products are available across the KeeMeds catalog. Browse the range of medicines and wellness essentials from this brand.`,
      logoColor: brandColor(match.name),
      productCount: match.count,
      categorySlugs: ["medicines"],
    };
  }

  async getBrandProducts(slug: string, query?: DiscoveryQuery): Promise<PaginatedResult<Product>> {
    const brandName = await this.brandNameFromSlug(slug);
    if (!brandName) return emptyResult(query?.page ?? 1, query?.pageSize ?? 12);

    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 12;
    const sortBy = query?.sortBy;

    // price_desc/rating have no backend discovery sort — resolve over the full
    // brand set and paginate locally (globally correct across pages).
    if (sortBy === "price_desc" || sortBy === "rating") {
      const set = await this.discoverSet({ brand: brandName });
      return paginateLocal(orderDiscoveryLocal(set, sortBy), page, pageSize);
    }

    const sortKey = toDiscoverySortKey(sortBy);
    const { message } = await this.requestPage({
      brand: brandName,
      sort: sortKey,
      page,
      page_size: pageSize,
    });
    const data = message.data;
    const items = Array.isArray(data.items)
      ? data.items.map((dto: ErpProductListItem) => productListItemMapper.toDomain(dto))
      : [];
    const total = Number(data.pagination?.total_records ?? items.length);
    const totalPages = Number(data.pagination?.total_pages ?? Math.max(1, Math.ceil(total / pageSize)));

    return {
      items,
      total,
      page: Number(data.pagination?.page ?? page),
      pageSize: Number(data.pagination?.page_size ?? pageSize),
      totalPages,
    };
  }

  /* ── Discovery: Collections ── */

  async getCollections(): Promise<Collection[]> {
    const items = await this.ensureAllItems();
    return COLLECTIONS.map((col) => {
      const isEssentials = col.slug === "essentials";
      let productCount = items.length;
      if (isEssentials) {
        productCount = items.filter(
          (item) => item.item_group?.trim().toLowerCase() === "allopathic",
        ).length;
      }
      return { ...col, productCount };
    });
  }

  async getCollectionBySlug(slug: string): Promise<Collection> {
    const col = COLLECTIONS.find((c) => c.slug === slug);
    if (!col) throw new ServiceError("Collection not found.", "NOT_FOUND", 404);
    const items = await this.ensureAllItems();
    const isEssentials = col.slug === "essentials";
    const productCount = isEssentials
      ? items.filter((item) => item.item_group?.trim().toLowerCase() === "allopathic").length
      : items.length;
    return { ...col, productCount };
  }

  async getCollectionProducts(_slug: CollectionSlug, query?: DiscoveryQuery): Promise<PaginatedResult<Product>> {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 12;
    const sortBy = query?.sortBy;

    // price_desc/rating have no backend discovery sort — resolve over the full
    // catalog and paginate locally (globally correct across pages).
    if (sortBy === "price_desc" || sortBy === "rating") {
      const set = await this.discoverSet({});
      return paginateLocal(orderDiscoveryLocal(set, sortBy), page, pageSize);
    }

    const sortKey = toDiscoverySortKey(sortBy);
    const { message } = await this.requestPage({
      sort: sortKey ?? "newest",
      page,
      page_size: pageSize,
    });
    const data = message.data;
    const items = Array.isArray(data.items)
      ? data.items.map((dto: ErpProductListItem) => productListItemMapper.toDomain(dto))
      : [];
    const total = Number(data.pagination?.total_records ?? items.length);
    const totalPages = Number(data.pagination?.total_pages ?? Math.max(1, Math.ceil(total / pageSize)));

    return {
      items,
      total,
      page: Number(data.pagination?.page ?? page),
      pageSize: Number(data.pagination?.page_size ?? pageSize),
      totalPages,
    };
  }

  /* ── Discovery: Health Concern products ── */

  async getHealthConcernProducts(slug: string, query?: DiscoveryQuery): Promise<PaginatedResult<Product>> {
    const concern = HEALTH_CONCERNS.find((c) => c.slug === slug);
    if (!concern) return emptyResult(query?.page ?? 1, query?.pageSize ?? 12);

    // The backend accepts one Item Group per request; use the first valid
    // group for this concern's related categories.
    const itemGroup = concern.relatedCategorySlugs
      .map((catSlug) => itemGroupForCategory(catSlug))
      .find((group): group is string => group != null);
    if (!itemGroup) return emptyResult(query?.page ?? 1, query?.pageSize ?? 12);

    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 12;
    const sortBy = query?.sortBy;

    // price_desc/rating have no backend discovery sort — resolve over the full
    // concern category set and paginate locally (globally correct).
    if (sortBy === "price_desc" || sortBy === "rating") {
      const set = await this.discoverSet({ item_group: itemGroup });
      return paginateLocal(orderDiscoveryLocal(set, sortBy), page, pageSize);
    }

    const sortKey = toDiscoverySortKey(sortBy);
    const { message } = await this.requestPage({
      item_group: itemGroup,
      sort: sortKey,
      page,
      page_size: pageSize,
    });
    const data = message.data;
    const items = Array.isArray(data.items)
      ? data.items.map((dto: ErpProductListItem) => productListItemMapper.toDomain(dto))
      : [];
    const total = Number(data.pagination?.total_records ?? items.length);
    const totalPages = Number(data.pagination?.total_pages ?? Math.max(1, Math.ceil(total / pageSize)));

    return {
      items,
      total,
      page: Number(data.pagination?.page ?? page),
      pageSize: Number(data.pagination?.page_size ?? pageSize),
      totalPages,
    };
  }

  /* ── Discovery: Recommendations (sort=newest on the live catalog) ── */

  async getBestSellers(limit = 12): Promise<Product[]> {
    return this.newestProducts(limit);
  }

  async getTrending(limit = 12): Promise<Product[]> {
    return this.newestProducts(limit);
  }

  async getNewArrivals(limit = 12): Promise<Product[]> {
    return this.newestProducts(limit);
  }

  private async newestProducts(limit: number): Promise<Product[]> {
    const { message } = await this.requestPage({ sort: "newest", page: 1, page_size: Math.max(1, limit) });
    const batch = Array.isArray(message.data?.items) ? message.data.items : [];
    return batch
      .slice(0, limit)
      .map((dto: ErpProductListItem) => productListItemMapper.toDomain(dto));
  }

  /* ── Recently viewed / batch lookups ── */

  async getRecentlyViewedProductIds(): Promise<string[]> {
    try {
      const raw = localStorage.getItem("keemeds-recently-viewed");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const settled = await Promise.all(ids.map((id) => this.fetchDetailDto(id).catch(() => null)));
    return settled
      .filter((detail): detail is ErpProductDetail => detail != null)
      .map((detail) => productDetailMapper.toDomain(detail));
  }

  /**
   * Category facets for search results, derived from the Item Groups of the
   * current result page (never hardcoded). Duplicated groups are aggregated
   * per navigation slug.
   */
  private categoryFacetsFrom(items: Product[]): CategoryFacet[] {
    const counts = new Map<string, number>();
    for (const product of items) {
      const slug = product.categorySlug || "medicines";
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
    return Array.from(counts, ([slug, count]) => ({
      slug,
      title: CATEGORY_TITLES[slug] ?? toTitleCase(slug),
      count,
    })).sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
  }
}

/** Title-case a slug for display when no curated title exists. */
function toTitleCase(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}