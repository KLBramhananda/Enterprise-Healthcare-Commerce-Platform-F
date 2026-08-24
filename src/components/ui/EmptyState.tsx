/**
 * EmptyState
 *
 * Displayed when a list or section has no data.
 * All styles reference design tokens from tokens.css.
 */

import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-200 bg-surface-50/50 p-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <FolderOpen size={24} />
      </div>
      <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-surface-500">{description}</p>
    </div>
  );
}
