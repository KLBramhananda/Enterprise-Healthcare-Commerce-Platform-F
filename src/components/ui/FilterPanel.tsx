/**
 * FilterPanel
 *
 * Enterprise-grade catalog filter panel with accordion sections, smooth
 * expand/collapse animations, in-section search for long lists, and
 * active-filter count badges on every section header.
 *
 * All filter groups — Price Range, Discount, Prescription, Availability,
 * Brand, Manufacturer — render through the same FilterOption primitive so
 * checkbox and radio rows are pixel-identical and never drift.
 *
 * Controlled by the parent (FilterModal manages the draft state).
 */

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, RotateCcw, Search, X } from "lucide-react";
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

/* ── Props ── */

interface FilterPanelProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  brands: BrandFacet[];
  manufacturers?: ManufacturerFacet[];
  className?: string;
  /** Hide the built-in "Filters" heading + inline "Clear all". Use when the
   *  panel is embedded inside a dialog that provides its own header/actions. */
  hideHeader?: boolean;
}

/* ── Static option lists ── */

const formatPrice = (v: number) => formatCurrency(v, { maximumFractionDigits: 0 });

const PRICE_OPTIONS: { id: PriceRangeId; label: string }[] = [
  { id: "under_5", label: `Under ${formatPrice(5)}` },
  { id: "5_to_10", label: `${formatPrice(5)} – ${formatPrice(10)}` },
  { id: "10_to_25", label: `${formatPrice(10)} – ${formatPrice(25)}` },
  { id: "above_25", label: `${formatPrice(25)} & above` },
];

const DISCOUNT_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "Any discount" },
  { value: 10, label: "10% or more" },
  { value: 20, label: "20% or more" },
  { value: 50, label: "50% or more" },
];

const RX_OPTIONS: { value: PrescriptionFilter; label: string }[] = [
  { value: "any", label: "All products" },
  { value: "otc_only", label: "OTC only" },
  { value: "rx_only", label: "Prescription required" },
];

/* ── Helpers ── */

function facetId(prefix: string, name: string | undefined | null): string {
  const safe = String(name ?? "opt")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${prefix}-${safe || "option"}`;
}

function toggleArray<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/* ── Animation variants ── */

const SECTION_BODY = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
  transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const },
};

/* ════════════════════════════════════════════════════════════════════════════ */

export default function FilterPanel({
  filters,
  onChange,
  brands = [],
  manufacturers = [],
  className,
  hideHeader = false,
}: FilterPanelProps) {
  const active = hasActiveFilters(filters);

  const brandList = useMemo(() => brands ?? [], [brands]);
  const manufacturerList = useMemo(() => manufacturers ?? [], [manufacturers]);

  /* ── Accordion state (all expanded by default) ── */
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["price", "discount", "rx", "avail", "brand", "mfr"]),
  );
  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  /* ── Search-within state ── */
  const [brandSearch, setBrandSearch] = useState("");
  const [mfrSearch, setMfrSearch] = useState("");

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brandList;
    const q = brandSearch.toLowerCase();
    return brandList.filter((b) => b.name.toLowerCase().includes(q));
  }, [brandList, brandSearch]);

  const filteredMfrs = useMemo(() => {
    if (!mfrSearch.trim()) return manufacturerList;
    const q = mfrSearch.toLowerCase();
    return manufacturerList.filter((m) => m.name.toLowerCase().includes(q));
  }, [manufacturerList, mfrSearch]);

  /* ── Active counts per section ── */
  const brandActive = filters.brands.length;
  const mfrActive = filters.manufacturers.length;

  const handleClearAll = () =>
    onChange({
      brands: [],
      manufacturers: [],
      priceRanges: [],
      minDiscountPercent: 0,
      prescription: "any",
      inStockOnly: false,
    });

  return (
    <div className={cn("flex flex-col", className)} aria-label="Catalog filters">
      {/* ── Panel header ── */}
      {!hideHeader && (
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold text-surface-900">Filters</h2>
          {active && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <RotateCcw size={12} />
              Clear all
            </button>
          )}
        </div>
      )}

      {/* ── Sections ── */}
      <div className="flex flex-col divide-y divide-surface-100">
        {/* Price Range */}
        <Section
          title="Price Range"
          sectionKey="price"
          expanded={expanded.has("price")}
          onToggle={() => toggle("price")}
          activeCount={filters.priceRanges.length}
        >
          <div className="space-y-0.5">
            {PRICE_OPTIONS.map((opt) => (
              <Option
                key={opt.id}
                id={`price-${opt.id}`}
                type="checkbox"
                label={opt.label}
                checked={filters.priceRanges.includes(opt.id)}
                onChange={() =>
                  onChange({ ...filters, priceRanges: toggleArray(filters.priceRanges, opt.id) })
                }
              />
            ))}
          </div>
        </Section>

        {/* Discount */}
        <Section
          title="Discount"
          sectionKey="discount"
          expanded={expanded.has("discount")}
          onToggle={() => toggle("discount")}
          activeCount={filters.minDiscountPercent > 0 ? 1 : 0}
        >
          <div role="radiogroup" aria-label="Minimum discount" className="space-y-0.5">
            {DISCOUNT_OPTIONS.map((opt) => (
              <Option
                key={opt.value}
                id={`disc-${opt.value}`}
                type="radio"
                name="min-discount"
                label={opt.label}
                checked={filters.minDiscountPercent === opt.value}
                onChange={() => onChange({ ...filters, minDiscountPercent: opt.value })}
              />
            ))}
          </div>
        </Section>

        {/* Prescription */}
        <Section
          title="Prescription"
          sectionKey="rx"
          expanded={expanded.has("rx")}
          onToggle={() => toggle("rx")}
          activeCount={filters.prescription !== "any" ? 1 : 0}
        >
          <div role="radiogroup" aria-label="Prescription requirement" className="space-y-0.5">
            {RX_OPTIONS.map((opt) => (
              <Option
                key={opt.value}
                id={`rx-${opt.value}`}
                type="radio"
                name="prescription"
                label={opt.label}
                checked={filters.prescription === opt.value}
                onChange={() => onChange({ ...filters, prescription: opt.value })}
              />
            ))}
          </div>
        </Section>

        {/* Availability */}
        <Section
          title="Availability"
          sectionKey="avail"
          expanded={expanded.has("avail")}
          onToggle={() => toggle("avail")}
          activeCount={filters.inStockOnly ? 1 : 0}
        >
          <Option
            id="in-stock-only"
            type="checkbox"
            label="Exclude out of stock"
            checked={filters.inStockOnly}
            onChange={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          />
        </Section>

        {/* Brand */}
        {brandList.length > 0 && (
          <Section
            title="Brand"
            sectionKey="brand"
            expanded={expanded.has("brand")}
            onToggle={() => toggle("brand")}
            activeCount={brandActive}
          >
            <SearchInput
              value={brandSearch}
              onChange={setBrandSearch}
              placeholder="Search brands…"
            />
            <div className="max-h-52 space-y-0.5 overflow-y-auto scroll-py-1 [scrollbar-width:thin] [scrollbar-color:var(--color-surface-300)_transparent]">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <Option
                    key={brand.name}
                    id={facetId("brand", brand.name)}
                    type="checkbox"
                    label={brand.name}
                    count={brand.count}
                    checked={filters.brands.includes(brand.name)}
                    onChange={() =>
                      onChange({ ...filters, brands: toggleArray(filters.brands, brand.name) })
                    }
                  />
                ))
              ) : (
                <p className="px-2 py-3 text-center text-xs text-surface-400">No matching brands</p>
              )}
            </div>
          </Section>
        )}

        {/* Manufacturer */}
        {manufacturerList.length > 0 && (
          <Section
            title="Manufacturer"
            sectionKey="mfr"
            expanded={expanded.has("mfr")}
            onToggle={() => toggle("mfr")}
            activeCount={mfrActive}
          >
            <SearchInput
              value={mfrSearch}
              onChange={setMfrSearch}
              placeholder="Search manufacturers…"
            />
            <div className="max-h-52 space-y-0.5 overflow-y-auto scroll-py-1 [scrollbar-width:thin] [scrollbar-color:var(--color-surface-300)_transparent]">
              {filteredMfrs.length > 0 ? (
                filteredMfrs.map((mfr) => (
                  <Option
                    key={mfr.name}
                    id={facetId("mfr", mfr.name)}
                    type="checkbox"
                    label={mfr.name}
                    count={mfr.count}
                    checked={filters.manufacturers.includes(mfr.name)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        manufacturers: toggleArray(filters.manufacturers, mfr.name),
                      })
                    }
                  />
                ))
              ) : (
                <p className="px-2 py-3 text-center text-xs text-surface-400">
                  No matching manufacturers
                </p>
              )}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════════════════════════════════════ */

/** Accordion section with animated expand/collapse. */
function Section({
  title,
  sectionKey,
  expanded,
  onToggle,
  activeCount = 0,
  children,
}: {
  title: string;
  sectionKey: string;
  expanded: boolean;
  onToggle: () => void;
  activeCount?: number;
  children: ReactNode;
}) {
  return (
    <section data-section={sectionKey} className="py-3">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-surface-50",
          activeCount > 0 && "bg-brand-50/40",
        )}
      >
        <span
          className={cn(
            "flex-1 text-xs font-semibold uppercase tracking-wider",
            activeCount > 0 ? "text-brand-700" : "text-surface-500",
          )}
        >
          {title}
        </span>

        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-100 px-1.5 text-[11px] font-semibold text-brand-700">
            {activeCount}
          </span>
        )}

        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex shrink-0 text-surface-400"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key={`${sectionKey}-body`}
            initial={SECTION_BODY.collapsed}
            animate={SECTION_BODY.expanded}
            exit={SECTION_BODY.collapsed}
            transition={SECTION_BODY.transition}
            className="overflow-hidden"
          >
            <div className="px-1 pt-1.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** Single filter option (checkbox or radio) with custom indicator. */
function Option({
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
        "group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
        "hover:bg-surface-50",
        checked && "bg-brand-50/30",
      )}
    >
      <input
        id={id}
        type={type}
        name={type === "radio" ? name : undefined}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />

      {/* Indicator */}
      <span
        aria-hidden="true"
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all duration-fast",
          type === "radio" && "rounded-full",
          checked
            ? "border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/20"
            : "border-surface-300 bg-surface-0 group-hover:border-surface-400",
        )}
      >
        {checked &&
          (type === "radio" ? (
            <span className="h-2 w-2 rounded-full bg-white" />
          ) : (
            <Check size={11} strokeWidth={3.5} />
          ))}
      </span>

      {/* Label */}
      <span
        className={cn(
          "min-w-0 flex-1 truncate leading-snug",
          checked ? "font-medium text-brand-800" : "text-surface-600",
        )}
      >
        {label}
      </span>

      {/* Count */}
      {count != null && (
        <span className="shrink-0 text-xs tabular-nums text-surface-400">{count}</span>
      )}
    </label>
  );
}

/** Compact search input for filtering long option lists. */
function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative mb-2">
      <Search
        size={14}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search…"}
        className="w-full rounded-lg border border-surface-200 bg-surface-50 py-[7px] pl-8 pr-7 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-colors focus:border-brand-400 focus:bg-surface-0 focus:ring-2 focus:ring-brand-500/10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-surface-400 transition-colors hover:text-surface-600"
          aria-label="Clear search"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
