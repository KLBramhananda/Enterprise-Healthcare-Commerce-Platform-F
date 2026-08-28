/**
 * BrandCard
 *
 * Display tile for a brand. Used in the brands grid and
 * inline brand carousels. Shows the brand name, tagline,
 * and a colored initial circle.
 */

import { Link } from "react-router-dom";
import type { BrandSummary } from "@/types/catalog";

interface BrandCardProps {
  brand: BrandSummary;
  className?: string;
}

export function BrandCard({ brand, className = "" }: BrandCardProps) {
  return (
    <Link
      to={`/brands/${brand.slug}`}
      className={`group block rounded-xl border border-surface-border bg-surface-elevated p-6 text-center transition-all hover:border-brand-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${className}`}
    >
      <div
        className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white transition-transform group-hover:scale-105"
        style={{ backgroundColor: brand.logoColor ?? "#6b7280" }}
      >
        {brand.name.charAt(0)}
      </div>
      <p className="text-body font-semibold text-surface-900">{brand.name}</p>
      {brand.tagline && (
        <p className="mt-1 text-caption text-surface-500 line-clamp-1">{brand.tagline}</p>
      )}
      {brand.productCount > 0 && (
        <p className="mt-2 text-micro text-surface-400">
          {brand.productCount} product{brand.productCount !== 1 ? "s" : ""}
        </p>
      )}
    </Link>
  );
}
