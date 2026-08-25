/**
 * ProductCard
 *
 * Reusable product card for the commerce catalog (grid layout).
 * Displays medicine details with discount/new/bestseller/Rx badges,
 * rating, MRP/discount pricing, stock status, and cart action.
 * When `id` is provided, the card links to /product/:id via an overlay.
 */

import { Link } from "react-router-dom";
import { BadgePercent, FileBadge, ShoppingCart } from "lucide-react";
import type { StockStatus } from "@/types/catalog";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import StarRating from "./StarRating";

interface ProductCardProps {
  id?: string;
  name: string;
  brandName: string;
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
  className?: string;
}

export default function ProductCard({
  id,
  name,
  brandName,
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
  className,
}: ProductCardProps) {
  const isOutOfStock = stockStatus === "out_of_stock";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-xl border border-surface-200 bg-surface-0 p-3 transition-all duration-normal ease-smooth",
        "hover:border-brand-200 hover:shadow-md sm:p-4",
        className,
      )}
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
      {/* Product Visual */}
      <div
        className={cn(
          "relative mb-3 flex aspect-square items-center justify-center rounded-lg border border-surface-100 bg-surface-50",
          isOutOfStock && "opacity-60",
        )}
      >
        <PillGlyph />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
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
          {isNew && (
            <span className="rounded-md bg-info-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-info-800 ring-1 ring-info-100">
              New
            </span>
          )}
        </div>
        {requiresPrescription && !isOutOfStock && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-md bg-info-50 px-1.5 py-0.5 text-[10px] font-semibold text-info-800 ring-1 ring-info-100">
            <FileBadge size={10} aria-hidden="true" />
            Rx Required
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute inset-x-2 bottom-2 rounded-md bg-surface-900/85 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white">
            Out of Stock
          </span>
        )}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            if (id) onAddToCart?.(id);
          }}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white opacity-0 shadow-sm transition-opacity duration-fast focus:opacity-100 group-hover:opacity-100 hover:bg-brand-700 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:bg-surface-300 disabled:text-surface-500"
          aria-label={
            isOutOfStock ? `${name} is out of stock` : `Add ${name} to cart`
          }
        >
          <ShoppingCart size={14} />
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-surface-400">{brandName}</p>
        <h3 className="text-sm font-semibold leading-snug text-surface-900">{name}</h3>
        <p className="text-xs text-surface-500">
          {form} &middot; {packSize}
        </p>

        <div className="mt-1 flex items-center gap-1.5">
          <StarRating value={rating} />
          <span className="text-xs text-surface-400">({formatNumberCompact(reviewCount)})</span>
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-brand-700">{formatCurrency(price)}</span>
            {originalPrice != null && originalPrice > price && (
              <span className="text-xs text-surface-400">
                MRP{" "}
                <span className="line-through">{formatCurrency(originalPrice)}</span>
              </span>
            )}
          </div>
          {!isOutOfStock && stockStatus === "low_stock" && (
            <p className="mt-1 text-[11px] font-medium text-danger-600">Only a few left</p>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Internal helpers ── */

function PillGlyph() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-10 w-10 text-surface-300 transition-colors duration-normal group-hover:text-brand-300"
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
