/**
 * EmptyState
 *
 * Displayed when a list or section has no data.
 * Supports an optional call-to-action below the description.
 * All styles reference design tokens from tokens.css.
 */

import type { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-200 bg-surface-50/50 p-12 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <FolderOpen size={24} aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-surface-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
