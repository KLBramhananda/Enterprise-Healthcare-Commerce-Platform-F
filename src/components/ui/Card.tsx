/**
 * Card
 *
 * Reusable card container with optional sub-components for structured layouts.
 * Composes from design tokens for consistent elevation, radius, and spacing.
 */

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

/* ── Card Root ── */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

function Card({ children, className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-surface-200 bg-surface-0 shadow-xs",
        interactive &&
          "cursor-pointer transition-all duration-normal ease-smooth hover:border-brand-200 hover:shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── CardHeader ── */

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn("border-b border-surface-100 px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
}

/* ── CardBody ── */

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardBody({ children, className, ...props }: CardBodyProps) {
  return (
    <div className={cn("px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
}

/* ── CardFooter ── */

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn("flex items-center border-t border-surface-100 px-5 py-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody, CardFooter };
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps };
