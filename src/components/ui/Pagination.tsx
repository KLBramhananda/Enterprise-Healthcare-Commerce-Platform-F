/**
 * Pagination
 *
 * Reusable pagination component for list views.
 */

import Button from "./Button";

interface PaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Pagination({
  currentPage,
  total,
  pageSize,
  hasNextPage,
  onPrevious,
  onNext,
}: PaginationProps) {
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white py-2 px-1">
      <div className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-medium text-slate-900">{start}</span>
        {" to "}
        <span className="font-medium text-slate-900">{end}</span>
        {" of "}
        <span className="font-medium text-slate-900">{total}</span>
        {" results"}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">
          Page {currentPage} of {totalPages}
        </span>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onPrevious} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button variant="secondary" size="sm" onClick={onNext} disabled={!hasNextPage}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
