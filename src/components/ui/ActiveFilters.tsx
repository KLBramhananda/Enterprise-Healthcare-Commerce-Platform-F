/**
 * ActiveFilters
 *
 * Horizontal row of dismissible filter chips rendered below the toolbar on
 * the Search Results and Catalog Results pages. Each chip represents one
 * active filter selection and can be individually removed. A "Clear all"
 * action removes every active filter at once.
 *
 * Uses the project's existing Chip component for visual consistency with
 * other pill/tag UI in the application.
 */

import { X } from "lucide-react";
import type { CatalogFilters, PriceRangeId } from "@/types/catalog";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatters";

/* ── Props ── */

interface ActiveFiltersProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  className?: string;
}

/* ── Chip data model ── */

interface FilterChip {
  id: string;
  label: string;
  category: keyof CatalogFilters;
  value: unknown;
}

const formatPrice = (v: number) => formatCurrency(v, { maximumFractionDigits: 0 });

const PRICE_LABELS: Record<PriceRangeId, string> = {
  under_5: `Under ${formatPrice(5)}`,
  "5_to_10": `${formatPrice(5)} – ${formatPrice(10)}`,
  "10_to_25": `${formatPrice(10)} – ${formatPrice(25)}`,
  above_25: `${formatPrice(25)} & above`,
};

const RX_LABELS: Record<string, string> = {
  otc_only: "OTC only",
  rx_only: "Prescription required",
};

/** Flatten active CatalogFilters into an ordered list of chips. */
function chipsFromFilters(f: CatalogFilters): FilterChip[] {
  const chips: FilterChip[] = [];

  for (const range of f.priceRanges) {
    chips.push({ id: `price-${range}`, label: PRICE_LABELS[range] ?? range, category: "priceRanges", value: range });
  }
  if (f.minDiscountPercent > 0) {
    chips.push({ id: "discount", label: `${f.minDiscountPercent}%+ off`, category: "minDiscountPercent", value: f.minDiscountPercent });
  }
  if (f.prescription !== "any") {
    chips.push({ id: "rx", label: RX_LABELS[f.prescription] ?? f.prescription, category: "prescription", value: f.prescription });
  }
  if (f.inStockOnly) {
    chips.push({ id: "inStock", label: "In stock only", category: "inStockOnly", value: true });
  }
  for (const brand of f.brands) {
    chips.push({ id: `brand-${brand}`, label: brand, category: "brands", value: brand });
  }
  for (const mfr of f.manufacturers) {
    chips.push({ id: `mfr-${mfr}`, label: mfr, category: "manufacturers", value: mfr });
  }

  return chips;
}

/** Remove a single chip from the filter state. */
function removeChip(prev: CatalogFilters, chip: FilterChip): CatalogFilters {
  switch (chip.category) {
    case "priceRanges":
      return { ...prev, priceRanges: prev.priceRanges.filter((r) => r !== chip.value) };
    case "minDiscountPercent":
      return { ...prev, minDiscountPercent: 0 };
    case "prescription":
      return { ...prev, prescription: "any" };
    case "inStockOnly":
      return { ...prev, inStockOnly: false };
    case "brands":
      return { ...prev, brands: prev.brands.filter((b) => b !== chip.value) };
    case "manufacturers":
      return { ...prev, manufacturers: prev.manufacturers.filter((m) => m !== chip.value) };
    default:
      return prev;
  }
}

/* ════════════════════════════════════════════════════════════════════════════ */

export default function ActiveFilters({ filters, onChange, className }: ActiveFiltersProps) {
  const chips = chipsFromFilters(filters);

  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onChange(removeChip(filters, chip))}
          className={cn(
            "group inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
            "border-brand-200 bg-brand-50 text-brand-700",
            "hover:border-brand-300 hover:bg-brand-100 hover:text-brand-800",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
          )}
        >
          <span className="max-w-[140px] truncate">{chip.label}</span>
          <X
            size={12}
            className="shrink-0 rounded-full p-[1px] text-brand-500 transition-colors group-hover:bg-brand-200 group-hover:text-brand-700"
          />
        </button>
      ))}

      <button
        type="button"
        onClick={() =>
          onChange({
            brands: [],
            manufacturers: [],
            priceRanges: [],
            minDiscountPercent: 0,
            prescription: "any",
            inStockOnly: false,
          })
        }
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
      >
        Clear all
      </button>
    </div>
  );
}
