/**
 * FilterModal
 *
 * Enterprise-grade filter dialog that wraps FilterPanel in a full-featured
 * modal overlay (focus trap, Escape, backdrop, body-scroll lock).
 *
 * The dialog edits a local draft copy of CatalogFilters so results never
 * refetch mid-selection. "Apply Filters" pushes the draft into URL search
 * params through the parent's onChange. The URL stays the source of truth
 * so query parameters and browser back/forward keep working.
 */

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import type {
  BrandFacet,
  CatalogFilters,
  CategoryFacet,
  ManufacturerFacet,
} from "@/types/catalog";
import { emptyCatalogFilters, hasActiveFilters } from "@/types/catalog";
import Button from "./Button";
import FilterPanel from "./FilterPanel";
import Modal from "./Modal";

/* ── Props ── */

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  brands: BrandFacet[];
  manufacturers: ManufacturerFacet[];
  categoryFacets?: CategoryFacet[];
}

/* ── Active filter count ── */

function countActive(f: CatalogFilters): number {
  return (
    f.priceRanges.length +
    (f.minDiscountPercent > 0 ? 1 : 0) +
    (f.prescription !== "any" ? 1 : 0) +
    (f.inStockOnly ? 1 : 0) +
    f.brands.length +
    f.manufacturers.length
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onChange,
  brands,
  manufacturers,
  categoryFacets = [],
}: FilterModalProps) {
  const [draft, setDraft] = useState<CatalogFilters>(filters);
  const wasOpenRef = useRef(isOpen);

  // Seed the draft from the committed filters on open and while closed.
  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;
    if (justOpened || !isOpen) setDraft(filters);
  }, [isOpen, filters]);

  const activeCount = useMemo(() => countActive(draft), [draft]);

  const handleApply = () => {
    onChange(draft);
    onClose();
  };

  const handleClearAll = () => setDraft(emptyCatalogFilters());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      size="lg"
      backdropBlur
      className="max-h-[90vh] sm:max-h-[85vh]"
      footer={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClearAll}
            disabled={!hasActiveFilters(draft)}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={14} />
            Clear all
          </button>
          <Button type="button" className="flex-1" onClick={handleApply}>
            {activeCount > 0
              ? `Apply ${activeCount} Filter${activeCount > 1 ? "s" : ""}`
              : "Apply Filters"}
          </Button>
        </div>
      }
    >
      {/* ── Category facets ── */}
      {categoryFacets.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
            Categories
          </p>
          <div className="flex flex-wrap gap-1.5">
            {categoryFacets.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-1.5 text-sm text-surface-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                <span>{cat.title}</span>
                <ArrowRight size={12} className="text-surface-400" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter panel ── */}
      <FilterPanelErrorBoundary onReset={() => setDraft(filters)}>
        <FilterPanel
          filters={draft}
          onChange={setDraft}
          brands={brands}
          manufacturers={manufacturers}
          hideHeader
        />
      </FilterPanelErrorBoundary>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Error boundary — contains facet-render crashes inside the dialog body
   instead of letting them blank the entire page.
   ════════════════════════════════════════════════════════════════════════════ */

class FilterPanelErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { hasError: boolean }
> {
  override state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override componentDidCatch(): void {
    this.props.onReset();
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <AlertCircle size={28} className="text-surface-300" />
          <p className="mt-3 text-sm font-medium text-surface-700">
            Some filter options could not be loaded.
          </p>
          <p className="mt-1 text-xs text-surface-400">
            Clear your selection and reopen the filters to try again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
