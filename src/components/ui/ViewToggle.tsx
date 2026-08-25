/**
 * ViewToggle
 *
 * Segmented control for switching between grid and list catalog views.
 * Implements the ARIA radiogroup pattern for accessible state communication.
 */

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/utils/cn";

export type CatalogView = "grid" | "list";

interface ViewToggleProps {
  value: CatalogView;
  onChange: (view: CatalogView) => void;
  className?: string;
}

const options: { value: CatalogView; label: string; icon: typeof List }[] = [
  { value: "grid", label: "Grid view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
];

export default function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Catalog view"
      className={cn(
        "inline-flex rounded-lg border border-surface-300 bg-surface-0 p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-8 w-9 items-center justify-center rounded-md transition-colors duration-fast",
              isActive
                ? "bg-brand-50 text-brand-700 shadow-xs"
                : "text-surface-500 hover:bg-surface-100 hover:text-surface-700",
            )}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
