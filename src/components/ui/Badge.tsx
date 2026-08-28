/**
 * Badge
 *
 * Status badge for displaying document states.
 * All styles reference design tokens from tokens.css.
 */

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-100 text-surface-800",
  success: "bg-success-50 text-success-800",
  warning: "bg-warning-50 text-warning-800",
  danger: "bg-danger-50 text-danger-800",
  info: "bg-info-50 text-info-800",
};

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
