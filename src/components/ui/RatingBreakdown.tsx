/**
 * RatingBreakdown
 *
 * Star distribution bar chart for the product reviews section.
 */

import StarRating from "./StarRating";
import { cn } from "@/utils/cn";

interface RatingBreakdownProps {
  averageRating: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  className?: string;
}

export default function RatingBreakdown({
  averageRating,
  totalReviews,
  distribution,
  className,
}: RatingBreakdownProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6", className)}>
      {/* Average */}
      <div className="flex flex-col items-center gap-1 sm:min-w-[100px]">
        <span className="text-4xl font-bold text-surface-900">{averageRating.toFixed(1)}</span>
        <StarRating value={averageRating} size={18} />
        <span className="text-xs text-surface-400">{totalReviews.toLocaleString()} reviews</span>
      </div>

      {/* Bars */}
      <div className="flex-1 space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((stars) => {
          const count = distribution[stars] ?? 0;
          const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-2">
              <span className="w-3 text-right text-xs font-medium text-surface-500">{stars}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-normal"
                  style={{ width: `${pct}%`, minWidth: count > 0 ? 2 : 0 }}
                />
              </div>
              <span className="w-8 text-right text-xs text-surface-400">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
