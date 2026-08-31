/**
 * SearchResultsPage
 *
 * Full search results experience with URL-synced query, filters, sorting,
 * pagination, health concern browsing, and helpful empty states.
 * All search data is sourced through the catalog service abstraction.
 */

import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import {
  Button,
  Container,
  EmptyState,
  FilterPanel,
  Pagination,
  ProductCard,
  ProductListItem,
  Select,
  Skeleton,
  ViewToggle,
} from "@/components/ui";
import type { CatalogView } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import {
  useSearchState,
  useSearchResults,
  useHealthConcerns,
} from "@/hooks/catalog";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { emptyCatalogFilters, hasActiveFilters } from "@/types/catalog";
import { CATALOG_PAGE_SIZE, CATALOG_SORT_OPTIONS } from "@/config/constants";
import { useProductActions } from "@/hooks/shopping";
import { cn } from "@/utils/cn";

export default function SearchResultsPage() {
  const {
    q,
    sortBy,
    filters,
    query,
    setParam,
  } = useSearchState();

  const searchQuery = useSearchResults(query);
  const concernsQuery = useHealthConcerns();

  const [view, setView] = useState<CatalogView>("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const results = searchQuery.data;
  const filtersActive = hasActiveFilters(filters);
  const hasQuery = q.trim().length > 0;
  const { handleAddToCart, handleToggleWishlist, isInWishlist } = useProductActions(
    results?.items ?? [],
  );

  usePageTitle(hasQuery ? `Search: ${q}` : "Search", "Find medicines, wellness products, and more");

  const goToPage = useCallback(
    (next: number) => {
      setParam("page", String(next));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setParam],
  );

  const handleFilterChange = useCallback(
    (next: typeof filters) => {
      if (next.brands.length > 0) setParam("brands", next.brands.join(","));
      else setParam("brands", null);
      if (next.prescription !== "any") setParam("rx", next.prescription);
      else setParam("rx", null);
      if (next.inStockOnly) setParam("inStock", "1");
      else setParam("inStock", null);
      if (next.minDiscountPercent > 0) setParam("discount", String(next.minDiscountPercent));
      else setParam("discount", null);
      if (next.priceRanges.length > 0) setParam("priceRanges", next.priceRanges.join(","));
      else setParam("priceRanges", null);
    },
    [setParam],
  );

  const clearAllFilters = useCallback(() => {
    handleFilterChange(emptyCatalogFilters());
  }, [handleFilterChange]);

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Search Results" }]} />

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
            <input
              type="text"
              defaultValue={q}
              key={q}
              placeholder="Search for medicines, wellness products, lab tests..."
              aria-label="Search products"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) {
                    setParam("q", val);
                    setParam("page", null);
                  }
                }
              }}
              className="w-full rounded-xl border border-surface-200 bg-surface-0 py-3 pl-12 pr-4 text-base text-surface-900 shadow-xs outline-none transition-all duration-fast placeholder:text-surface-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        </div>
      </Container>

      <Container className="mt-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Filter Sidebar */}
          <aside
            id="search-filter-sidebar"
            className={cn("lg:w-64 lg:shrink-0", mobileFiltersOpen ? "block" : "hidden lg:block")}
            aria-label="Search filters"
          >
            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 shadow-xs z-base lg:sticky" style={{ top: "var(--layout-sticky-offset)" }}>
              {results?.categoryFacets && results.categoryFacets.length > 0 && (
                <div className="mb-5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                    Categories
                  </p>
                  <div className="space-y-1">
                    {results.categoryFacets.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-surface-600 transition-colors hover:bg-surface-50 hover:text-brand-700"
                      >
                        <span>{cat.title}</span>
                        <span className="text-xs text-surface-400">{cat.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <FilterPanel
                filters={filters}
                onChange={handleFilterChange}
                brands={[]}
              />
            </div>
          </aside>

          {/* Results */}
          <section className="min-w-0 flex-1" aria-label="Search results">
            {/* Toolbar */}
            <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-surface-200 bg-surface-0 p-3 shadow-xs sm:gap-3 sm:p-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((open) => !open)}
                aria-expanded={mobileFiltersOpen}
                aria-controls="search-filter-sidebar"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-surface-300 px-3 py-2 text-sm font-medium text-surface-700 transition-colors hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 lg:hidden"
              >
                <SlidersHorizontal size={15} aria-hidden="true" />
                Filters
                {filtersActive && (
                  <span className="h-2 w-2 rounded-full bg-brand-600" aria-label="Filters active" />
                )}
              </button>

              <p className="hidden text-sm text-surface-500 sm:block" aria-live="polite">
                {results ? (
                  hasQuery ? (
                    <>
                      <span className="text-surface-400">Results for </span>
                      <span className="font-semibold text-surface-900">&ldquo;{results.query}&rdquo;</span>
                      <span className="text-surface-400"> — </span>
                      <span className="font-semibold text-surface-900">{results.total}</span>
                      <span className="text-surface-400"> product{results.total !== 1 ? "s" : ""}</span>
                    </>
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-surface-900">{results.items.length}</span>{" "}
                      of{" "}
                      <span className="font-semibold text-surface-900">{results.total}</span> products
                    </>
                  )
                ) : (
                  "Searching…"
                )}
              </p>

              <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                <Select
                  aria-label="Sort results by"
                  value={sortBy}
                  onChange={(e) => setParam("sort", e.target.value)}
                  options={CATALOG_SORT_OPTIONS.map((o) => ({ ...o }))}
                  className="w-auto max-w-[7rem] sm:max-w-none sm:w-44"
                />
                <ViewToggle value={view} onChange={setView} />
              </div>
            </div>

            {/* Content */}
            {!hasQuery ? (
              <SearchLanding concerns={concernsQuery.data ?? []} onSelect={(term) => setParam("q", term)} />
            ) : searchQuery.isError ? (
              <EmptyState
                title="Something went wrong"
                description="We couldn't load search results. Please try again."
                action={
                  <Button variant="secondary" onClick={() => void searchQuery.refetch()}>
                    <RotateCcw size={14} className="mr-1.5" aria-hidden="true" />
                    Retry
                  </Button>
                }
              />
            ) : searchQuery.isLoading || !results ? (
              <ResultsSkeleton view={view} />
            ) : results.items.length === 0 ? (
              <EmptyState
                title={`No results found for "${q}"`}
                description="Try using different keywords, check your spelling, or browse our categories below."
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={clearAllFilters} className={cn(!filtersActive && "hidden")}>
                      Clear filters
                    </Button>
                    <Link
                      to="/categories"
                      className="inline-flex items-center justify-center rounded-md border border-surface-300 bg-surface-0 px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50"
                    >
                      Browse categories
                    </Link>
                  </div>
                }
              />
            ) : (
              <>
                <div
                  className={cn(
                    "transition-opacity duration-normal",
                    searchQuery.isFetching && "opacity-60",
                  )}
                >
                  {view === "grid" ? (
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                      {results.items.map((product) => (
                        <li key={product.id}>
                           <ProductCard {...product} originalPrice={product.mrp} isInWishlist={isInWishlist(product.id)} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {results.items.map((product) => (
                        <li key={product.id}>
                           <ProductListItem {...product} originalPrice={product.mrp} isInWishlist={isInWishlist(product.id)} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {results.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={results.page}
                      total={results.total}
                      pageSize={results.pageSize}
                      hasNextPage={results.page < results.totalPages}
                      onPrevious={() => goToPage(results.page - 1)}
                      onNext={() => goToPage(results.page + 1)}
                      onGoToPage={goToPage}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}

/* ── Search Landing (no query) ── */

function SearchLanding({
  concerns,
  onSelect,
}: {
  concerns: { slug: string; name: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }> }[];
  onSelect: (term: string) => void;
}) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <Search size={24} />
      </div>
      <h2 className="text-lg font-semibold text-surface-900">What are you looking for?</h2>
      <p className="mt-1 text-sm text-surface-500">
        Search for medicines, wellness products, lab tests, and more.
      </p>

      {concerns.length > 0 && (
        <div className="mt-8">
          <p className="mb-4 text-sm font-medium text-surface-700">Browse by Health Concern</p>
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {concerns.map((concern) => {
              const Icon = concern.icon;
              return (
                <button
                  key={concern.slug}
                  type="button"
                  onClick={() => onSelect(concern.name)}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-surface-200 bg-surface-0 p-4 transition-all duration-fast hover:border-brand-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <Icon size={20} className="text-brand-500 transition-colors group-hover:text-brand-600" />
                  <span className="text-sm font-medium text-surface-700 group-hover:text-brand-700">
                    {concern.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Loading Skeleton ── */

function ResultsSkeleton({ view }: { view: CatalogView }) {
  if (view === "list") {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex gap-4 rounded-xl border border-surface-200 bg-surface-0 p-4">
            <Skeleton className="h-28 w-full shrink-0 bg-surface-100 sm:h-32 sm:w-32" />
            <div className="hidden flex-1 space-y-2 py-1 sm:block">
              <Skeleton className="h-3 w-20 bg-surface-100" />
              <Skeleton className="h-4 w-2/3 bg-surface-100" />
              <Skeleton className="h-3 w-1/2 bg-surface-100" />
            </div>
            <div className="hidden w-36 flex-col items-end gap-2 sm:flex">
              <Skeleton className="h-6 w-20 bg-surface-100" />
              <Skeleton className="h-9 w-full bg-surface-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: CATALOG_PAGE_SIZE }, (_, i) => (
        <li key={i}>
          <div className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl bg-surface-100" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 bg-surface-100" />
              <Skeleton className="h-3 w-1/2 bg-surface-100" />
              <Skeleton className="h-5 w-1/3 bg-surface-100" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
