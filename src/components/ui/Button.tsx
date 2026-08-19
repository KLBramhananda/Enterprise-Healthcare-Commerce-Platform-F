/**
 * Button
 *
 * Reusable button component with variant support.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500",
  danger:
    "border border-red-300 bg-white text-red-700 hover:bg-red-50 focus:ring-red-500",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
