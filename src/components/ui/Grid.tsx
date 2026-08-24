/**
 * Grid
 *
 * Responsive grid layout utility with consistent gap and column configurations.
 * Class names are resolved from static maps of fully-qualified utilities so
 * the Tailwind scanner can detect every generated class.
 */

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
type GridGap = "sm" | "md" | "lg";

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  cols?: GridColumns;
  gap?: GridGap;
  responsive?: {
    sm?: { cols?: GridColumns; gap?: GridGap };
    md?: { cols?: GridColumns; gap?: GridGap };
    lg?: { cols?: GridColumns; gap?: GridGap };
  };
}

/* Every entry must be a complete literal class name for Tailwind's scanner. */
const colStyles: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  8: "grid-cols-8",
  12: "grid-cols-12",
};

const smColStyles: Record<GridColumns, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  8: "sm:grid-cols-8",
  12: "sm:grid-cols-12",
};

const mdColStyles: Record<GridColumns, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  8: "md:grid-cols-8",
  12: "md:grid-cols-12",
};

const lgColStyles: Record<GridColumns, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  8: "lg:grid-cols-8",
  12: "lg:grid-cols-12",
};

const gapStyles: Record<GridGap, string> = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

const smGapStyles: Record<GridGap, string> = {
  sm: "sm:gap-3",
  md: "sm:gap-4",
  lg: "sm:gap-6",
};

const mdGapStyles: Record<GridGap, string> = {
  sm: "md:gap-3",
  md: "md:gap-4",
  lg: "md:gap-6",
};

const lgGapStyles: Record<GridGap, string> = {
  sm: "lg:gap-3",
  md: "lg:gap-4",
  lg: "lg:gap-6",
};

function Grid({ children, cols = 1, gap = "md", responsive, className, ...props }: GridProps) {
  const responsiveClasses = responsive
    ? [
        responsive.sm?.cols && smColStyles[responsive.sm.cols],
        responsive.sm?.gap && smGapStyles[responsive.sm.gap],
        responsive.md?.cols && mdColStyles[responsive.md.cols],
        responsive.md?.gap && mdGapStyles[responsive.md.gap],
        responsive.lg?.cols && lgColStyles[responsive.lg.cols],
        responsive.lg?.gap && lgGapStyles[responsive.lg.gap],
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <div
      className={cn("grid", colStyles[cols], gapStyles[gap], responsiveClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Grid };
export type { GridProps, GridColumns, GridGap };
