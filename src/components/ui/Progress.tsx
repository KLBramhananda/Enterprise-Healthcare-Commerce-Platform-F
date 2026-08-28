/**
 * Progress
 *
 * Circular and linear progress indicators.
 * All styles reference design tokens from tokens.css.
 */

import { cn } from "@/utils/cn";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-brand-600 transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold text-surface-900">
        {Math.round(value)}%
      </span>
    </div>
  );
}

interface LinearProgressProps {
  value: number;
  className?: string;
}

export function LinearProgress({ value, className }: LinearProgressProps) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-100", className)}>
      <div
        className="h-full rounded-full bg-brand-600 transition-all duration-500 ease-out"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}
