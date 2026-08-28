/**
 * StarRating
 *
 * Reusable star rating display with accessible label.
 * Supports fractional values via a partially filled star.
 */

import { Star, StarHalf } from "lucide-react";
import { cn } from "@/utils/cn";

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
}

export default function StarRating({ value, size = 14, className }: StarRatingProps) {
  const clamped = Math.min(5, Math.max(0, value));
  const fullStars = Math.floor(clamped);
  const hasHalfStar = clamped - fullStars >= 0.25 && clamped - fullStars < 0.75;
  const roundedFull = clamped - fullStars >= 0.75 ? fullStars + 1 : fullStars;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: roundedFull }, (_, i) => (
        <Star key={`full-${i}`} size={size} className="fill-amber-400 text-amber-400" />
      ))}
      {hasHalfStar && (
        <span className="relative inline-flex" aria-hidden="true">
          <Star size={size} className="text-surface-300" />
          <StarHalf
            size={size}
            className="absolute inset-0 fill-amber-400 text-amber-400"
            strokeWidth={1.5}
          />
        </span>
      )}
      {Array.from({ length: 5 - roundedFull - (hasHalfStar ? 1 : 0) }, (_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-surface-300" />
      ))}
    </span>
  );
}
