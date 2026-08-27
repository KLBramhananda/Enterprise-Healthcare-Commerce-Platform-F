/**
 * SectionHeader
 *
 * Reusable section heading with title, subtitle, and optional action link/button.
 */

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export default function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:mb-10", className)}>
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 sm:text-[1.75rem] sm:leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-sm leading-relaxed text-surface-500 sm:text-base sm:text-surface-600">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
