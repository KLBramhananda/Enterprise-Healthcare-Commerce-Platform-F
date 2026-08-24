/**
 * Button
 *
 * Reusable button component with variant and size support.
 * All styles reference design tokens from tokens.css.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500",
  secondary:
    "border border-surface-300 bg-surface-0 text-surface-700 hover:bg-surface-50 focus:ring-surface-500",
  danger:
    "border border-danger-600/30 bg-surface-0 text-danger-600 hover:bg-danger-50 focus:ring-danger-500",
  ghost:
    "text-surface-600 hover:bg-surface-100 hover:text-surface-900 focus:ring-surface-500",
  link:
    "text-brand-600 underline-offset-4 hover:underline focus:ring-brand-500 px-0",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-fast ease-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
