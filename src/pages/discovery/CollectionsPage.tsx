/**
 * CollectionsPage
 *
 * Grid of all available product collections.
 * Route: /collections
 */

import { Link } from "react-router-dom";
import { Container, EmptyState, Skeleton, CollectionCard } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { useCollections } from "@/hooks/catalog";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { AlertCircle } from "lucide-react";

export default function CollectionsPage() {
  usePageTitle("Collections", "Browse curated product collections");

  const collectionsQuery = useCollections();
  const collections = collectionsQuery.data;

  if (collectionsQuery.isError) {
    return (
      <Container className="py-16">
        <div className="flex flex-col items-center text-center">
          <AlertCircle size={48} className="text-danger-400" />
          <h2 className="mt-4 text-lg font-semibold text-surface-900">Failed to load collections</h2>
          <p className="mt-1 text-sm text-surface-500">
            We couldn't fetch the collections list. Please check your connection and try again.
          </p>
          <button
            onClick={() => collectionsQuery.refetch()}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Try again
          </button>
        </div>
      </Container>
    );
  }

  if (!collectionsQuery.isLoading && collections && collections.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          title="No collections found"
          description="We are working on bringing you curated collections."
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
            { label: "Collections" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">Collections</h1>
          <p className="mt-1 max-w-2xl text-sm text-surface-500">
            Explore curated product collections for your healthcare needs
          </p>
        </header>

        <div className="mt-6">
          {collectionsQuery.isLoading || !collections ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
