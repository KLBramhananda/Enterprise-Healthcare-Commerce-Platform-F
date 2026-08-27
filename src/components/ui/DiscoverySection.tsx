/**
 * DiscoverySection
 *
 * Generic section wrapper for product recommendation grids.
 * Used for Best Sellers, Trending, New Arrivals, and similar sections.
 */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import Container from "./Container";
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
  /** Background color class applied to the outer <section>. Defaults to surface-0. */
  background?: string;
  /** Vertical padding classes for the section. */
  spacing?: string;
}

export function DiscoverySection({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View All",
  isLoading = false,
  isEmpty = false,
  children,
  skeletonCount = 4,
  background = "bg-surface-0",
  spacing = "py-10 sm:py-12",
}: DiscoverySectionProps) {
  const viewAllAction = viewAllHref ? (
    <Link
      to={viewAllHref}
      className="group inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-brand-600 transition-colors duration-fast hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
    >
      {viewAllLabel}
      <ArrowRight
        size={15}
        aria-hidden="true"
        className="transition-transform duration-fast group-hover:translate-x-0.5"
      />
    </Link>
  ) : undefined;

  if (isLoading) {
    return (
      <section className={cn(background, spacing)} aria-busy="true">
        <Container>
          <SectionHeader title={title} subtitle={subtitle} action={viewAllAction} />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (isEmpty) return null;

  return (
    <section className={cn(background, spacing)}>
      <Container>
        <SectionHeader
          title={title}
          subtitle={subtitle}
          action={viewAllAction}
        />
        <div className="mt-6">{children}</div>
      </Container>
    </section>
  );
}
