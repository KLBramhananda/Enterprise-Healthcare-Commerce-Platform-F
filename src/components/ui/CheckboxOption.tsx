/**
 * CheckboxOption
 *
 * Small presentational checkbox row used by filter groups.
 * Pairs a native checkbox input (for accessibility) with styled visuals.
 */

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface CheckboxOptionProps {
  id: string;
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
}

export default function CheckboxOption({
  id,
  label,
  checked,
  onChange,
  count,
}: CheckboxOptionProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-fast",
        "hover:bg-surface-100",
        checked && "text-brand-800",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-fast",
          checked
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-surface-300 bg-surface-0 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2",
        )}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1 truncate text-surface-700">{label}</span>
      {count != null && (
        <span className="shrink-0 text-xs text-surface-400">({count})</span>
      )}
    </label>
  );
}
