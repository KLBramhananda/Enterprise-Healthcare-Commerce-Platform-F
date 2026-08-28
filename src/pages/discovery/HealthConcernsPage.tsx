/**
 * HealthConcernsPage
 *
 * Lists all health concern topics as clickable cards.
 * Route: /health-concerns
 */

import { Link } from "react-router-dom";
import { Container, EmptyState, Skeleton } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { useHealthConcerns } from "@/hooks/catalog";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { AlertCircle } from "lucide-react";

export default function HealthConcernsPage() {
  usePageTitle("Health Concerns", "Browse products by health concern");

  const concernsQuery = useHealthConcerns();
  const concerns = concernsQuery.data;

  if (concernsQuery.isError) {
    return (
      <Container className="py-16">
        <div className="flex flex-col items-center text-center">
          <AlertCircle size={48} className="text-danger-400" />
          <h2 className="mt-4 text-lg font-semibold text-surface-900">Failed to load health concerns</h2>
          <p className="mt-1 text-sm text-surface-500">
            We couldn't fetch the health concerns list. Please check your connection and try again.
          </p>
          <button
            onClick={() => concernsQuery.refetch()}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Try again
          </button>
        </div>
      </Container>
    );
  }

  if (!concernsQuery.isLoading && concerns && concerns.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          title="No health concerns found"
          description="We are working on adding more health concern categories."
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
            { label: "Health Concerns" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            Health Concerns
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-surface-500">
            Find the right products for your specific health needs
          </p>
        </header>

        <div className="mt-6">
          {concernsQuery.isLoading || !concerns ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {concerns.map((concern) => (
                <Link
                  key={concern.slug}
                  to={`/health-concerns/${concern.slug}`}
                  className="group block rounded-xl border border-surface-border bg-surface-elevated p-6 transition-all hover:border-brand-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  <h2 className="text-body-lg font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                    {concern.name}
                  </h2>
                  {concern.description && (
                    <p className="mt-1 text-body text-surface-500 line-clamp-2">
                      {concern.description}
                    </p>
                  )}
                  {concern.relatedCategorySlugs.length > 0 && (
                    <p className="mt-2 text-caption text-surface-400">
                      {concern.relatedCategorySlugs.length} related categories
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
