/**
 * BrandDetailPage
 *
 * Brand profile page with logo, tagline, description, and product grid.
 * Route: /brands/:slug
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import {
  Button,
  Container,
  EmptyState,
  Pagination,
  ProductCard,
  Select,
  Skeleton,
  SkeletonCard,
} from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { useBrandBySlug, useBrandProducts } from "@/hooks/catalog";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import type { DiscoverySortOption } from "@/types/catalog";
import { useCart, useWishlist } from "@/hooks/shopping";
import { notifyAddedToCart, notifyAddedToWishlist, notifyRemovedFromWishlist } from "@/utils/notifications";
import { CATALOG_SORT_OPTIONS, CATALOG_PAGE_SIZE } from "@/config/constants";

export default function BrandDetailPage() {
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();
  const { slug } = useParams<{ slug: string }>();
  const brandQuery = useBrandBySlug(slug);
  const brand = brandQuery.data;

  usePageTitle(brand?.name ?? "Brand", brand?.tagline);

  const [sortBy, setSortBy] = useState<DiscoverySortOption>("popularity");
  const [page, setPage] = useState(1);

  const productsQuery = useBrandProducts(slug, { sortBy, page, pageSize: CATALOG_PAGE_SIZE });
  const products = productsQuery.data;

  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!brandQuery.isLoading && !brand) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Brand not found"
          description="The brand you are looking for does not exist."
          action={
            <Link
              to="/brands"
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition-colors duration-fast hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Browse all brands
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
            { label: "Brands", path: "/brands" },
            { label: brand?.name ?? "…" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          {brand ? (
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ backgroundColor: brand.logoColor ?? "#6b7280" }}
              >
                {brand.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
                  {brand.name}
                </h1>
                {brand.tagline && (
                  <p className="mt-1 text-sm text-surface-500">{brand.tagline}</p>
                )}
                {brand.description && (
                  <p className="mt-2 max-w-2xl text-sm text-surface-600 leading-relaxed">
                    {brand.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          )}
        </header>
      </Container>

      <Container className="mt-6">
        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-surface-200 bg-surface-0 p-3 shadow-xs sm:p-4">
          <p className="text-sm text-surface-500" aria-live="polite">
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
          <Select
            aria-label="Sort products by"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as DiscoverySortOption);
              setPage(1);
            }}
            options={CATALOG_SORT_OPTIONS.map((option) => ({ ...option, value: option.value as string }))}
            className="w-44"
          />
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
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4"
            aria-hidden="true"
          >
            {Array.from({ length: CATALOG_PAGE_SIZE }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.items.length === 0 ? (
          <EmptyState
            title="No products from this brand"
            description="This brand does not have any products listed yet."
          />
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {products.items.map((product) => (
                <li key={product.id}>
                    <ProductCard {...product} originalPrice={product.mrp} isInWishlist={isInWishlist(product.id)} onAddToCart={(id) => { const p = products.items.find((x) => x.id === id); if (p) { addItem(p); notifyAddedToCart(p); } }} onToggleWishlist={(id) => { const p = products.items.find((x) => x.id === id); if (p) { if (isInWishlist(id)) { removeWishlist(id); notifyRemovedFromWishlist(p); } else { addWishlist(p); notifyAddedToWishlist(p); } } }} />
                </li>
              ))}
            </ul>
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
      </Container>
    </div>
  );
}
