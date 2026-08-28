/**
 * CollectionDetailPage
 *
 * Collection detail page with products grid, sorting, and pagination.
 * Route: /collections/:slug
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
import { useCollectionBySlug, useCollectionProducts } from "@/hooks/catalog";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { COLLECTION_META, CATALOG_SORT_OPTIONS, CATALOG_PAGE_SIZE } from "@/config/constants";
import { useProductActions } from "@/hooks/shopping";
import type { CollectionSlug, DiscoverySortOption } from "@/types/catalog";

const ACCENT_BORDER: Record<string, string> = {
  brand: "border-l-brand-500",
  blue: "border-l-blue-500",
  purple: "border-l-purple-500",
  amber: "border-l-amber-500",
  green: "border-l-green-500",
  pink: "border-l-pink-500",
};

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const collectionQuery = useCollectionBySlug(slug);
  const collection = collectionQuery.data;

  const meta = slug ? COLLECTION_META[slug] : undefined;
  const accentBorder = slug ? (ACCENT_BORDER[meta?.accent ?? "brand"] ?? ACCENT_BORDER.brand) : "";

  usePageTitle(collection?.title ?? "Collection", collection?.description);

  const [sortBy, setSortBy] = useState<DiscoverySortOption>("popularity");
  const [page, setPage] = useState(1);

  const productsQuery = useCollectionProducts(slug as CollectionSlug | undefined, {
    sortBy,
    page,
    pageSize: CATALOG_PAGE_SIZE,
  });
  const products = productsQuery.data;
  const { handleAddToCart, handleToggleWishlist, isInWishlist } = useProductActions(
    products?.items ?? [],
  );

  const discoverySortOptions = CATALOG_SORT_OPTIONS.filter(
    (o) => o.value !== "discount" && o.value !== "name_asc",
  ).map((o) => ({ ...o, value: o.value as DiscoverySortOption }));

  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!collectionQuery.isLoading && !collection) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Collection not found"
          description="The collection you are looking for does not exist."
          action={
            <Link
              to="/collections"
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition-colors duration-fast hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Browse all collections
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
            { label: "Collections", path: "/collections" },
            { label: collection?.title ?? "…" },
          ]}
        />

        <header className={`mt-4 border-b border-surface-200 pb-5 border-l-4 pl-4 ${accentBorder}`}>
          {collection ? (
            <>
              <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
                {collection.title}
              </h1>
              {collection.description && (
                <p className="mt-1 max-w-2xl text-sm text-surface-500">{collection.description}</p>
              )}
            </>
          ) : (
            <div className="space-y-2 py-1">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-full max-w-xl" />
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
            options={discoverySortOptions}
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
            title="No products in this collection"
            description="This collection does not have any products yet."
          />
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {products.items.map((product) => (
                <li key={product.id}>
                    <ProductCard {...product} originalPrice={product.mrp} isInWishlist={isInWishlist(product.id)} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} />
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
