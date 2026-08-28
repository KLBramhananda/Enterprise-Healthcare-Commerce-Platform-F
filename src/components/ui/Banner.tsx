/**
 * Banner
 *
 * Reusable CTA banner for promotional messages, announcements, and app downloads.
 * Supports gradient backgrounds, icon, text, and action buttons.
 */

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type BannerVariant = "primary" | "dark" | "light";

interface BannerProps extends HTMLAttributes<HTMLElement> {
  variant?: BannerVariant;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<BannerVariant, string> = {
  primary: "bg-brand-600 text-white",
  dark: "bg-surface-900 text-surface-300",
  light: "bg-surface-100 text-surface-900",
};

function Banner({ variant = "primary", icon, children, className, ...props }: BannerProps) {
  return (
    <section className={cn(variantStyles[variant], className)} {...props}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:text-left">
        {icon && (
          <div
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg",
              variant === "primary" && "bg-brand-500 text-white",
              variant === "dark" && "bg-surface-800 text-surface-300",
              variant === "light" && "bg-surface-0 text-surface-700",
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">{children}</div>
      </div>
    </section>
  );
}

function BannerTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-xl font-bold sm:text-2xl", className)}>{children}</h2>
  );
}

function BannerDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mt-1 text-sm sm:text-base", className)}>{children}</p>
  );
}

function BannerActions({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex shrink-0 justify-center gap-3 sm:justify-start", className)}>
      {children}
    </div>
  );
}

export { Banner, BannerTitle, BannerDescription, BannerActions };
export type { BannerProps, BannerVariant };
