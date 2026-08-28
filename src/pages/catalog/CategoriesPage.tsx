/**
 * CategoriesPage
 *
 * Category listing page — the entry point for catalog browsing.
 * Displays all categories with icon, description, and product count.
 * Data is sourced through the catalog service layer.
 */

import { Link } from "react-router-dom";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import {
  Button,
  Container,
  EmptyState,
  Grid,
  IconTile,
  Skeleton,
} from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { useCatalogCategories } from "@/hooks/catalog";
import { usePageTitle } from "@/hooks/layout/usePageTitle";

export default function CategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useCatalogCategories();

  usePageTitle("Categories", "Browse products by category");

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Categories" }]} />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            Shop by Category
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-surface-500">
            Browse our full range of medicines, wellness products, devices, and more.
          </p>
        </header>

        <div className="mt-8">
          {isError ? (
            <EmptyState
              title="Something went wrong"
              description="We couldn't load the categories. Please try again."
              action={
                <Button variant="secondary" onClick={() => void refetch()}>
                  <RotateCcw size={14} className="mr-1.5" aria-hidden="true" />
                  Retry
                </Button>
              }
            />
          ) : isLoading ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <Skeleton className="h-36 rounded-xl bg-surface-100 sm:h-32" />
                </li>
              ))}
            </ul>
          ) : !categories || categories.length === 0 ? (
            <EmptyState
              title="No categories yet"
              description="Categories will appear here once they are published."
            />
          ) : (
            <Grid cols={1} gap="md" responsive={{ sm: { cols: 2 }, lg: { cols: 3 } }}>
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  slug={category.slug}
                  title={category.title}
                  description={category.description}
                  icon={<category.icon size={22} aria-hidden="true" />}
                  color={category.color}
                  productCount={category.productCount}
                />
              ))}
            </Grid>
          )}
        </div>
      </Container>
    </div>
  );
}

/* ── Category Card ── */

interface CategoryCardProps {
  slug: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: "brand" | "blue" | "green" | "purple" | "amber" | "pink" | "orange" | "cyan";
  productCount: number;
}

function CategoryCard({ slug, title, description, icon, color, productCount }: CategoryCardProps) {
  return (
    <Link
      to={`/category/${slug}`}
      className="group flex h-full flex-col rounded-xl border border-surface-200 bg-surface-0 p-5 shadow-xs transition-all duration-normal ease-smooth hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <div className="flex items-center gap-4">
        <IconTile
          icon={icon}
          size="md"
          color={color}
          className="transition-transform duration-normal ease-smooth group-hover:scale-110"
        />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-surface-900 group-hover:text-brand-700">
            {title}
          </h2>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-surface-400">
            {productCount} {productCount === 1 ? "product" : "products"}
          </p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-surface-500">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
        Browse
        <ArrowRight
          size={14}
          aria-hidden="true"
          className="transition-transform duration-normal group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}
