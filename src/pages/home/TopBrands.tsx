/**
 * TopBrands
 *
 * Featured pharmaceutical brand tiles.
 * Content is sourced from the homepage service layer.
 * Uses Container, SectionHeader from the design system.
 */

import { BadgeCheck } from "lucide-react";
import { Container, SectionHeader, Skeleton } from "@/components/ui";
import { useHomepageContent } from "@/hooks/homepage";
import { formatNumber } from "@/utils/formatters";

export default function TopBrands() {
  const { data, isLoading } = useHomepageContent();

  return (
    <section className="bg-surface-50 py-10 sm:py-12">
      <Container>
        <SectionHeader
          title="Top Brands"
          subtitle="Authentic products from brands you trust"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl sm:h-32" />
              ))
            : data?.topBrands.map((brand) => (
                <article
                  key={brand.id}
                  className="group flex h-full flex-col items-center rounded-xl border border-surface-200 bg-surface-0 p-4 text-center shadow-xs transition-all duration-normal ease-smooth hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md sm:p-5"
                  aria-label={`${brand.name}, ${formatNumber(brand.productCount)} products`}
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-sm transition-transform duration-normal ease-smooth group-hover:scale-110"
                    aria-hidden="true"
                  >
                    {brand.name.charAt(0)}
                  </span>
                  <h3 className="mt-3 flex items-center gap-1 text-sm font-semibold text-surface-900">
                    {brand.name}
                    <BadgeCheck size={14} className="shrink-0 text-brand-600" aria-label="Verified brand" />
                  </h3>
                  <p className="mt-0.5 text-xs text-surface-500">{brand.tagline}</p>
                  <p className="mt-auto pt-2 text-[11px] font-medium uppercase tracking-wide text-surface-400">
                    {formatNumber(brand.productCount)} products
                  </p>
                </article>
              ))}
        </div>
      </Container>
    </section>
  );
}
