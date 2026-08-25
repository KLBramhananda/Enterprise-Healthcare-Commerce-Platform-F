/**
 * ProductListItem
 *
 * Reusable horizontal product card for catalog list view.
 * Shares the same data contract as ProductCard with a row layout.
 * When `id` is provided, the card links to /product/:id via an overlay.
 */

import { Link } from "react-router-dom";
import { BadgePercent, FileBadge, ShoppingCart } from "lucide-react";
import type { StockStatus } from "@/types/catalog";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import StarRating from "./StarRating";

interface ProductListItemProps {
  id?: string;
  name: string;
  brandName: string;
  manufacturer?: string;
  form: string;
  packSize: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  requiresPrescription: boolean;
  stockStatus?: StockStatus;
  isNew?: boolean;
  isBestseller?: boolean;
  onAddToCart?: (productId: string) => void;
}

export default function ProductListItem({
  id,
  name,
  brandName,
  manufacturer,
  form,
  packSize,
  price,
  originalPrice,
  discountPercent,
  rating,
  reviewCount,
  requiresPrescription,
  stockStatus = "in_stock",
  isNew = false,
  isBestseller = false,
  onAddToCart,
}: ProductListItemProps) {
  const isOutOfStock = stockStatus === "out_of_stock";

  return (
    <article
      className={cn(
        "relative flex flex-col gap-4 rounded-xl border border-surface-200 bg-surface-0 p-3 transition-all duration-normal ease-smooth sm:flex-row sm:p-4",
        "hover:border-brand-200 hover:shadow-md",
      )}
      aria-label={name}
    >
      {/* Overlay link — covers the card, sits behind interactive elements */}
      {id && (
        <Link
          to={`/product/${id}`}
          className="absolute inset-0 rounded-xl"
          aria-label={`View ${name} details`}
          tabIndex={-1}
        >
          <span className="sr-only">View {name}</span>
        </Link>
      )}
      {/* Visual */}
      <div
        className={cn(
          "relative flex h-28 w-full shrink-0 items-center justify-center self-start rounded-lg border border-surface-100 bg-surface-50 sm:h-32 sm:w-32",
          isOutOfStock && "opacity-60",
        )}
        aria-hidden="true"
      >
        <PillGlyph />
        <div className="absolute left-1.5 top-1.5 flex flex-col items-start gap-1">
          {discountPercent != null && discountPercent > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-danger-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              <BadgePercent size={10} aria-hidden="true" />
              {discountPercent}% OFF
            </span>
          )}
          {isBestseller && (
            <span className="rounded-md bg-warning-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning-800 ring-1 ring-warning-100">
              Bestseller
            </span>
          )}
          {isNew && !isBestseller && (
            <span className="rounded-md bg-info-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-info-800 ring-1 ring-info-100">
              New
            </span>
          )}
        </div>
        {isOutOfStock && (
          <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-surface-900/85 py-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-white">
            Out of Stock
          </span>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-surface-400">{brandName}</p>
        <h3 className="mt-0.5 text-base font-semibold leading-snug text-surface-900">{name}</h3>
        <p className="mt-0.5 text-xs text-surface-500">
          {form} &middot; {packSize}
          {manufacturer && <> &middot; By {manufacturer}</>}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <StarRating value={rating} />
          <span className="text-xs text-surface-400">
            ({formatNumberCompact(reviewCount)} reviews)
          </span>
          {requiresPrescription ? (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-info-50 px-1.5 py-0.5 text-[10px] font-semibold text-info-800 ring-1 ring-info-100">
              <FileBadge size={10} aria-hidden="true" />
              Rx Required
            </span>
          ) : (
            <span className="rounded-md bg-success-50 px-1.5 py-0.5 text-[10px] font-semibold text-success-800 ring-1 ring-success-100">
              OTC
            </span>
          )}
          {!isOutOfStock && stockStatus === "low_stock" && (
            <span className="text-[11px] font-medium text-danger-600">Only a few left</span>
          )}
        </div>
      </div>

      {/* Price + Action */}
      <div className="flex shrink-0 items-end justify-between gap-3 border-t border-surface-100 pt-3 sm:w-40 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
        <div className="text-left sm:text-right">
          <p className="text-lg font-bold text-brand-700">{formatCurrency(price)}</p>
          {originalPrice != null && originalPrice > price && (
            <p className="text-xs text-surface-400">
              MRP <span className="line-through">{formatCurrency(originalPrice)}</span>
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            if (id) onAddToCart?.(id);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-fast hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-surface-200 disabled:text-surface-500"
          aria-label={isOutOfStock ? `${name} is out of stock` : `Add ${name} to cart`}
        >
          <ShoppingCart size={14} aria-hidden="true" />
          {isOutOfStock ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

/* ── Internal helpers ── */

function PillGlyph() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-10 w-10 text-surface-300 transition-colors duration-normal hover:text-brand-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="6" y="16" width="36" height="16" rx="8" transform="rotate(-45 24 24)" />
      <line x1="17" y1="17" x2="31" y2="31" />
    </svg>
  );
}

function formatNumberCompact(value: number): string {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(value);
}
