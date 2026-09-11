/**
 * FilterModal
 *
 * Centered modal filter experience (Tata 1mg style) that replaces the
 * always-visible desktop filter sidebar on the search results page.
 *
 * The modal edits a local draft copy of the filter state so the live results
 * never refetch mid-selection. "Apply Filters" pushes the draft into the URL
 * search params through the parent's onChange, which automatically re-triggers
 * React Query via useSearchState — then closes the modal. Because the URL stays
 * the source of truth, query parameters and browser back/forward navigation
 * keep working exactly as before.
 *
 * The page behind the dialog is dimmed, blurred, and scroll-locked by the
 * shared Modal primitive.
 */

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, RotateCcw } from "lucide-react";
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

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  brands: BrandFacet[];
  manufacturers: ManufacturerFacet[];
  categoryFacets?: CategoryFacet[];
}

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

  // Seed the draft from the committed filters only on open and while the popup
  // is closed. While it is open the draft is left completely alone, so the
  // popup can never flash blank or have in-dialog selections clobbered by a
  // committed `filters` change (e.g. browser back/forward while the dialog is
  // open).
  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;
    if (justOpened || !isOpen) {
      setDraft(filters);
    }
  }, [isOpen, filters]);

  const handleApply = () => {
    onChange(draft);
    onClose();
  };

  const handleClearAll = () => {
    setDraft(emptyCatalogFilters());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      size="lg"
      backdropBlur
      footer={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClearAll}
            disabled={!hasActiveFilters(draft)}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium text-brand-600 transition-colors duration-fast hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Clear All
          </button>
          <Button type="button" className="flex-1" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      }
    >
      {categoryFacets.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
            Categories
          </p>
          <div className="space-y-0.5">
            {categoryFacets.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                onClick={onClose}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-surface-600 transition-colors duration-fast hover:bg-surface-100 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span>{cat.title}</span>
                <span className="text-xs text-surface-400">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

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

/* ── Sub-component ── */

/**
 * Safety net around the filter panel. Any unexpected facet-rendering error is
 * contained here so the dialog shows a small, recoverable message instead of
 * unmounting the whole app into a blank white screen.
 */
class FilterPanelErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { hasError: boolean }
> {
  override state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override componentDidCatch(): void {
    // Errors here only affect the filter popup body; resetting the draft lets
    // the user restore a healthy panel without leaving the page.
    this.props.onReset();
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <AlertCircle size={28} className="text-surface-400" />
          <p className="mt-3 text-sm font-medium text-surface-900">
            Some filter options could not be loaded.
          </p>
          <p className="mt-1 text-xs text-surface-500">
            Try clearing the current selection and opening the filter again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}