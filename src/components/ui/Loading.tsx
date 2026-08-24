/**
 * Loading
 *
 * Global loading indicator component.
 * All styles reference design tokens from tokens.css.
 */

import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "Loading data..." }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      <span className="mt-4 text-sm font-medium text-surface-500">{message}</span>
    </div>
  );
}
