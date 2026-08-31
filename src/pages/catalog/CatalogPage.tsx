/**
 * CatalogPage
 *
 * Product catalog browsing page for a category.
 * Composes breadcrumb, filter sidebar (static facets), sorting, grid/list
 * view toggle, paginated product results, and loading/empty/error states.
 * All data is sourced through the catalog service layer.
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
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
  SkeletonCard,
  ViewToggle,
} from "@/components/ui";
import type { CatalogView } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { useCatalogBrands, useCatalogCategory, useProducts } from "@/hooks/catalog";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { emptyCatalogFilters, hasActiveFilters } from "@/types/catalog";
import type { CatalogFilters, CatalogSortOption } from "@/types/catalog";
import { CATALOG_PAGE_SIZE, CATALOG_SORT_OPTIONS } from "@/config/constants";
import { useProductActions } from "@/hooks/shopping";
import { cn } from "@/utils/cn";

export default function CatalogPage() {
  const { slug } = useParams<{ slug: string }>();
  const categoryQuery = useCatalogCategory(slug);
  const category = categoryQuery.data;

  usePageTitle(category?.title ?? "Catalog", "Browse healthcare products");

  const [sortBy, setSortBy] = useState<CatalogSortOption>("popularity");
  const [view, setView] = useState<CatalogView>("grid");
  const [filters, setFilters] = useState<CatalogFilters>(emptyCatalogFilters);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const brandsQuery = useCatalogBrands(slug);

  const productsQuery = useProducts({
    categorySlug: slug,
    sortBy,
    filters,
    page,
    pageSize: CATALOG_PAGE_SIZE,
  });
  const products = productsQuery.data;
  const filtersActive = hasActiveFilters(filters);
  const { handleAddToCart, handleToggleWishlist, isInWishlist } = useProductActions(
    products?.items ?? [],
  );

  const handleFilterChange = (next: CatalogFilters) => {
    setFilters(next);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(emptyCatalogFilters());
    setPage(1);
  };

  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Unknown category ── */
  if (!categoryQuery.isLoading && !category) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Category not found"
          description="The category you are looking for does not exist or may have been moved."
          action={
            <Link
              to="/categories"
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition-colors duration-fast hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Browse all categories
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Categories", path: "/categories" },
            { label: category?.title ?? "…" },
          ]}
        />

        {/* Category header */}
        <header className="mt-4 border-b border-surface-200 pb-5">
          {category ? (
            <>
              <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
                {category.title}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-surface-500">{category.description}</p>
            </>
          ) : (
            <div className="space-y-2 py-1" aria-hidden="true">
              <Skeleton className="h-7 w-56 bg-surface-100" />
              <Skeleton className="h-4 w-full max-w-xl bg-surface-100" />
            </div>
          )}
        </header>
      </Container>

      <Container className="mt-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Filter Sidebar */}
          <aside
            id="catalog-filter-sidebar"
            className={cn("lg:w-64 lg:shrink-0", mobileFiltersOpen ? "block" : "hidden lg:block")}
            aria-label="Product filters"
          >
            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 shadow-xs z-base lg:sticky" style={{ top: "var(--layout-sticky-offset)" }}>
              <FilterPanel
                filters={filters}
                onChange={handleFilterChange}
                brands={brandsQuery.data ?? []}
              />
            </div>
          </aside>

          {/* Results */}
          <section className="min-w-0 flex-1" aria-label="Products">
            {/* Toolbar */}
            <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-surface-200 bg-surface-0 p-3 shadow-xs sm:gap-3 sm:p-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((open) => !open)}
                aria-expanded={mobileFiltersOpen}
                aria-controls="catalog-filter-sidebar"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-surface-300 px-3 py-2 text-sm font-medium text-surface-700 transition-colors duration-fast hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 lg:hidden"
              >
                <SlidersHorizontal size={15} aria-hidden="true" />
                Filters
                {filtersActive && (
                  <span
                    className="h-2 w-2 rounded-full bg-brand-600"
                    aria-label="Filters active"
                  />
                )}
              </button>

              <p className="hidden text-sm text-surface-500 sm:block" aria-live="polite">
                {products ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-surface-900">{products.items.length}</span>{" "}
                    of{" "}
                    <span className="font-semibold text-surface-900">{products.total}</span> products
                  </>
                ) : (
                  "Loading products…"
                )}
              </p>

              <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                <Select
                  aria-label="Sort products by"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as CatalogSortOption);
                    setPage(1);
                  }}
                  options={CATALOG_SORT_OPTIONS.map((option) => ({ ...option }))}
                  className="w-auto max-w-[7rem] sm:max-w-none sm:w-44"
                />
                <ViewToggle value={view} onChange={setView} />
              </div>
            </div>

            {/* States */}
            {productsQuery.isError ? (
              <EmptyState
                title="Something went wrong"
                description="We couldn't load these products. Please try again."
                action={
                  <Button variant="secondary" onClick={() => void productsQuery.refetch()}>
                    <RotateCcw size={14} className="mr-1.5" aria-hidden="true" />
                    Retry
                  </Button>
                }
              />
            ) : productsQuery.isLoading || !products ? (
              <ResultsSkeleton view={view} />
            ) : products.items.length === 0 ? (
              <EmptyState
                title="No products match your filters"
                description="Try adjusting or clearing some filters to see more results."
                action={
                  filtersActive ? (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <div
                  className={
                    cn(
                      "transition-opacity duration-normal",
                      productsQuery.isFetching && "opacity-60",
                    )
                  }
                >
                  {view === "grid" ? (
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                      {products.items.map((product) => (
                        <li key={product.id}>
                           <ProductCard {...product} originalPrice={product.mrp} isInWishlist={isInWishlist(product.id)} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {products.items.map((product) => (
                        <li key={product.id}>
                           <ProductListItem {...product} originalPrice={product.mrp} isInWishlist={isInWishlist(product.id)} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {products.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={products.page}
                      total={products.total}
                      pageSize={products.pageSize}
                      hasNextPage={products.page < products.totalPages}
                      onPrevious={() => goToPage(products.page - 1)}
                      onNext={() => goToPage(products.page + 1)}
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

/* ── Helpers ── */

function ResultsSkeleton({ view }: { view: CatalogView }) {
  if (view === "list") {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-xl border border-surface-200 bg-surface-0 p-4"
          >
            <Skeleton className="h-28 w-full shrink-0 bg-surface-100 sm:h-32 sm:w-32" />
            <div className="hidden flex-1 space-y-2 py-1 sm:block">
              <Skeleton className="h-3 w-20 bg-surface-100" />
              <Skeleton className="h-4 w-2/3 bg-surface-100" />
              <Skeleton className="h-3 w-1/2 bg-surface-100" />
              <Skeleton className="h-3 w-32 bg-surface-100" />
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
    <ul
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: CATALOG_PAGE_SIZE }, (_, i) => (
        <li key={i}>
          <SkeletonCard />
        </li>
      ))}
    </ul>
  );
}
