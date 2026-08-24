/**
 * Chip
 *
 * Compact element for category labels, filters, or tags.
 * Supports icon, active state, and dismiss action.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  active?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  children: ReactNode;
}

export default function Chip({
  icon,
  active = false,
  dismissible = false,
  onDismiss,
  children,
  className,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-normal ease-smooth",
        active
          ? "bg-brand-50 text-brand-700 ring-1 ring-brand-300"
          : "bg-surface-0 text-surface-600 ring-1 ring-surface-200 hover:bg-surface-50 hover:text-surface-900 hover:ring-surface-300",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
      <span>{children}</span>
      {dismissible && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onDismiss?.();
            }
          }}
          className="ml-0.5 -mr-1 shrink-0 rounded-full p-0.5 transition-colors hover:bg-surface-200"
          aria-label="Dismiss"
        >
          <X size={12} />
        </span>
      )}
    </button>
  );
}
