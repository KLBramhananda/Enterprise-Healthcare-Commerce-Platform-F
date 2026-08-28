/**
 * BrandsPage
 *
 * Grid of all available brands. Each brand renders as a clickable card
 * that navigates to /brands/:slug.
 */

import { Link } from "react-router-dom";
import { Container, EmptyState, Skeleton, BrandCard } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { useBrands } from "@/hooks/catalog";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { AlertCircle } from "lucide-react";

export default function BrandsPage() {
  usePageTitle("Brands", "Browse all healthcare brands");

  const brandsQuery = useBrands();
  const brands = brandsQuery.data;

  if (brandsQuery.isError) {
    return (
      <Container className="py-16">
        <div className="flex flex-col items-center text-center">
          <AlertCircle size={48} className="text-danger-400" />
          <h2 className="mt-4 text-lg font-semibold text-surface-900">Failed to load brands</h2>
          <p className="mt-1 text-sm text-surface-500">
            We couldn't fetch the brands list. Please check your connection and try again.
          </p>
          <button
            onClick={() => brandsQuery.refetch()}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Try again
          </button>
        </div>
      </Container>
    );
  }

  if (!brandsQuery.isLoading && brands && brands.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          title="No brands found"
          description="We are working on bringing more brands to the platform."
          action={
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition-colors duration-fast hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Go to homepage
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
            { label: "Brands" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">Brands</h1>
          <p className="mt-1 max-w-2xl text-sm text-surface-500">
            Discover trusted healthcare brands and browse their product ranges
          </p>
        </header>

        <div className="mt-6">
          {brandsQuery.isLoading || !brands ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
