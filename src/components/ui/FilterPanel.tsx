/**
 * FilterPanel
 *
 * Static catalog facet filters: price range, discount, prescription
 * requirement, availability, and brand. Fully controlled by the parent.
 *
 * Every filter group — Price, Discount, Prescription, Availability, Brand,
 * Manufacturer — renders through the SAME FilterRow primitive so the rows are
 * pixel-identical (markers may be a checkbox or a radio dot, but the layout,
 * spacing and label truncation are shared). This keeps behaviour consistent
 * with the Price filter and removes any alignment drift between groups.
 */

import { Check, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import type {
  BrandFacet,
  CatalogFilters,
  ManufacturerFacet,
  PrescriptionFilter,
  PriceRangeId,
} from "@/types/catalog";
import { hasActiveFilters } from "@/types/catalog";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatters";

interface FilterPanelProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  brands: BrandFacet[];
  manufacturers?: ManufacturerFacet[];
  className?: string;
  /** Hide the "Filters" heading + inline "Clear all" control. Use when the
   *  panel is embedded inside a dialog that provides its own header/actions. */
  hideHeader?: boolean;
}

const formatRangePrice = (value: number): string =>
  formatCurrency(value, { maximumFractionDigits: 0 });

const PRICE_RANGE_OPTIONS: { id: PriceRangeId; label: string }[] = [
  { id: "under_5", label: `Under ${formatRangePrice(5)}` },
  { id: "5_to_10", label: `${formatRangePrice(5)} – ${formatRangePrice(10)}` },
  { id: "10_to_25", label: `${formatRangePrice(10)} – ${formatRangePrice(25)}` },
  { id: "above_25", label: `${formatRangePrice(25)} & above` },
];

const DISCOUNT_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "Any discount" },
  { value: 10, label: "10% or more" },
  { value: 20, label: "20% or more" },
  { value: 50, label: "50% or more" },
];

const PRESCRIPTION_OPTIONS: { value: PrescriptionFilter; label: string }[] = [
  { value: "any", label: "All products" },
  { value: "otc_only", label: "OTC only" },
  { value: "rx_only", label: "Prescription required" },
];

/** Build a stable, valid element id from an arbitrary facet name. Never throws
 *  on missing/special characters (a crash here would blank the filter popup). */
function facetId(prefix: string, name: string | undefined | null): string {
  const safe = String(name ?? "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${prefix}-${safe || "option"}`;
}

export default function FilterPanel({ filters, onChange, brands = [], manufacturers = [], className, hideHeader = false }: FilterPanelProps) {
  const active = hasActiveFilters(filters);

  const brandList = brands ?? [];
  const manufacturerList = manufacturers ?? [];

  const toggleArrayValue = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className={cn("flex flex-col gap-6", className)} aria-label="Catalog filters">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-surface-900">Filters</h2>
          {active && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, brands: [], manufacturers: [], priceRanges: [], minDiscountPercent: 0, prescription: "any", inStockOnly: false })}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 transition-colors duration-fast hover:text-brand-700"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Clear all
            </button>
          )}
        </div>
      )}

      <FilterSection title="Price">
        <div className="space-y-0.5">
          {PRICE_RANGE_OPTIONS.map((option) => (
            <FilterRow
              key={option.id}
              id={`price-${option.id}`}
              type="checkbox"
              label={option.label}
              checked={filters.priceRanges.includes(option.id)}
              onChange={() =>
                onChange({
                  ...filters,
                  priceRanges: toggleArrayValue(filters.priceRanges, option.id),
                })
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Discount">
        <div role="radiogroup" aria-label="Minimum discount" className="space-y-0.5">
          {DISCOUNT_OPTIONS.map((option) => (
            <FilterRow
              key={option.value}
              id={`discount-${option.value}`}
              type="radio"
              name="min-discount"
              label={option.label}
              checked={filters.minDiscountPercent === option.value}
              onChange={() => onChange({ ...filters, minDiscountPercent: option.value })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Prescription">
        <div role="radiogroup" aria-label="Prescription requirement" className="space-y-0.5">
          {PRESCRIPTION_OPTIONS.map((option) => (
            <FilterRow
              key={option.value}
              id={`rx-${option.value}`}
              type="radio"
              name="prescription"
              label={option.label}
              checked={filters.prescription === option.value}
              onChange={() => onChange({ ...filters, prescription: option.value })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <FilterRow
          id="in-stock-only"
          type="checkbox"
          label="Exclude out of stock"
          checked={filters.inStockOnly}
          onChange={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
        />
      </FilterSection>

      <FilterSection title="Brand">
        <div className="-mx-2 max-h-56 space-y-0.5 overflow-y-auto px-2">
          {brandList.map((brand) => (
            <FilterRow
              key={brand.name}
              id={facetId("brand", brand.name)}
              type="checkbox"
              label={brand.name}
              count={brand.count}
              checked={filters.brands.includes(brand.name)}
              onChange={() =>
                onChange({ ...filters, brands: toggleArrayValue(filters.brands, brand.name) })
              }
            />
          ))}
        </div>
      </FilterSection>

      {manufacturerList.length > 0 && (
        <FilterSection title="Manufacturer">
          <div className="-mx-2 max-h-56 space-y-0.5 overflow-y-auto px-2">
            {manufacturerList.map((manufacturer) => (
              <FilterRow
                key={manufacturer.name}
                id={facetId("manufacturer", manufacturer.name)}
                type="checkbox"
                label={manufacturer.name}
                count={manufacturer.count}
                checked={filters.manufacturers.includes(manufacturer.name)}
                onChange={() =>
                  onChange({
                    ...filters,
                    manufacturers: toggleArrayValue(filters.manufacturers, manufacturer.name),
                  })
                }
              />
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** The single filter row primitive shared by EVERY filter group. Layout is
 *  identical to the Price-filer rows; a radio group just shows a dot instead
 *  of a check. Shared code path = no alignment drift, no crash-prone ad-hoc
 *  rows. */
function FilterRow({
  id,
  type = "checkbox",
  name,
  label,
  checked,
  count,
  onChange,
}: {
  id: string;
  type?: "checkbox" | "radio";
  name?: string;
  label: ReactNode;
  checked: boolean;
  count?: number;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-fast",
        "hover:bg-surface-100",
        checked && "text-brand-800",
      )}
    >
      <input
        id={id}
        type={type}
        name={type === "radio" ? name : undefined}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-fast",
          type === "radio" && "rounded-full",
          checked
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-surface-300 bg-surface-0 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2",
        )}
      >
        {checked &&
          (type === "radio" ? (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          ) : (
            <Check size={12} strokeWidth={3} />
          ))}
      </span>
      <span className="min-w-0 flex-1 truncate text-surface-700">{label}</span>
      {count != null && (
        <span className="shrink-0 text-xs text-surface-400">({count})</span>
      )}
    </label>
  );
}