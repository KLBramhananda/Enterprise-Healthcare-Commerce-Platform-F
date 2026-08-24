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
    <div className={cn("mb-6 flex items-end justify-between", className)}>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-surface-500">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
