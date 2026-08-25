/**
 * FilterPanel
 *
 * Static catalog facet filters: price range, discount, prescription
 * requirement, availability, and brand. Fully controlled by the parent.
 */

import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import type {
  BrandFacet,
  CatalogFilters,
  PrescriptionFilter,
  PriceRangeId,
} from "@/types/catalog";
import { hasActiveFilters } from "@/types/catalog";
import { cn } from "@/utils/cn";
import CheckboxOption from "./CheckboxOption";

interface FilterPanelProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  brands: BrandFacet[];
  className?: string;
}

const PRICE_RANGE_OPTIONS: { id: PriceRangeId; label: string }[] = [
  { id: "under_5", label: "Under $5" },
  { id: "5_to_10", label: "$5 – $10" },
  { id: "10_to_25", label: "$10 – $25" },
  { id: "above_25", label: "$25 & above" },
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

export default function FilterPanel({ filters, onChange, brands, className }: FilterPanelProps) {
  const active = hasActiveFilters(filters);

  const toggleArrayValue = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className={cn("flex flex-col gap-6", className)} aria-label="Catalog filters">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-surface-900">Filters</h2>
        {active && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, brands: [], priceRanges: [], minDiscountPercent: 0, prescription: "any", inStockOnly: false })}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 transition-colors duration-fast hover:text-brand-700"
          >
            <RotateCcw size={12} aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Price">
        {PRICE_RANGE_OPTIONS.map((option) => (
          <CheckboxOption
            key={option.id}
            id={`price-${option.id}`}
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
      </FilterSection>

      <FilterSection title="Discount">
        <div role="radiogroup" aria-label="Minimum discount" className="space-y-0.5">
          {DISCOUNT_OPTIONS.map((option) => (
            <RadioRow
              key={option.value}
              id={`discount-${option.value}`}
              name="min-discount"
              label={option.label}
              checked={filters.minDiscountPercent === option.value}
              onSelect={() => onChange({ ...filters, minDiscountPercent: option.value })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Prescription">
        <div role="radiogroup" aria-label="Prescription requirement" className="space-y-0.5">
          {PRESCRIPTION_OPTIONS.map((option) => (
            <RadioRow
              key={option.value}
              id={`rx-${option.value}`}
              name="prescription"
              label={option.label}
              checked={filters.prescription === option.value}
              onSelect={() => onChange({ ...filters, prescription: option.value })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <CheckboxOption
          id="in-stock-only"
          label="Exclude out of stock"
          checked={filters.inStockOnly}
          onChange={(checked) => onChange({ ...filters, inStockOnly: checked })}
        />
      </FilterSection>

      <FilterSection title="Brand">
        <div className="-mx-2 max-h-56 space-y-0.5 overflow-y-auto px-2">
          {brands.map((brand) => (
            <CheckboxOption
              key={brand.name}
              id={`brand-${brand.name.toLowerCase().replace(/\s+/g, "-")}`}
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

function RadioRow({
  id,
  name,
  label,
  checked,
  onSelect,
}: {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-fast hover:bg-surface-100"
    >
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-fast",
          checked
            ? "border-brand-600 bg-brand-600"
            : "border-surface-300 bg-surface-0 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2",
        )}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span className="text-surface-700">{label}</span>
    </label>
  );
}
