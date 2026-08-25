/**
 * DiscoverySection
 *
 * Generic section wrapper for product recommendation grids.
 * Used for Best Sellers, Trending, New Arrivals, and similar sections.
 */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import { Skeleton } from "./Skeleton";

interface DiscoverySectionProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  children: ReactNode;
  /** Number of skeleton items to render when loading. */
  skeletonCount?: number;
}

export function DiscoverySection({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
  isLoading = false,
  isEmpty = false,
  children,
  skeletonCount = 4,
}: DiscoverySectionProps) {
  if (isLoading) {
    return (
      <section className="py-8 md:py-12" aria-busy="true">
        <SectionHeader title={title} subtitle={subtitle} />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (isEmpty) return null;

  return (
    <section className="py-8 md:py-12">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={viewAllHref ? <Link to={viewAllHref} className="text-sm font-medium text-brand-600 hover:underline">{viewAllLabel}</Link> : undefined}
      />
      <div className="mt-4">{children}</div>
    </section>
  );
}
