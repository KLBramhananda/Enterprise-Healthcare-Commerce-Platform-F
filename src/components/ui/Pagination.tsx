/**
 * Pagination
 *
 * Reusable pagination component for list views.
 * Shows a results summary, page indicator, and prev/next controls,
 * with optional numbered page buttons.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface PaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGoToPage?: (page: number) => void;
}

function getPageWindow(current: number, totalPages: number): number[] {
  const windowSize = 5;
  const start = Math.max(1, Math.min(current - 2, totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({
  currentPage,
  total,
  pageSize,
  hasNextPage,
  onPrevious,
  onNext,
  onGoToPage,
}: PaginationProps) {
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 border-t border-surface-200 bg-surface-0 px-1 py-3 sm:flex-row"
    >
      <p className="text-sm text-surface-500">
        Showing{" "}
        <span className="font-medium text-surface-900">{start}</span>
        {" to "}
        <span className="font-medium text-surface-900">{end}</span>
        {" of "}
        <span className="font-medium text-surface-900">{total}</span>
        {" results"}
      </p>

      <div className="flex items-center gap-4">
        <span className="text-sm text-surface-500">
          Page {currentPage} of {totalPages}
        </span>

        {onGoToPage && totalPages > 1 && (
          <div className="hidden items-center gap-1 md:flex">
            {getPageWindow(currentPage, totalPages).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onGoToPage(page)}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  "h-8 min-w-8 rounded-md px-1 text-sm font-medium transition-colors duration-fast",
                  page === currentPage
                    ? "bg-brand-600 text-white"
                    : "text-surface-600 hover:bg-surface-100",
                )}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-md border border-surface-300 bg-surface-0 px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors duration-fast hover:bg-surface-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNextPage}
            className="inline-flex items-center gap-1 rounded-md border border-surface-300 bg-surface-0 px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors duration-fast hover:bg-surface-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}
