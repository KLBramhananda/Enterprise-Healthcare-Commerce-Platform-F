/**
 * Container
 *
 * Responsive content wrapper that enforces consistent max-width and padding
 * across all page sections. Single source of truth for layout width.
 */

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type ContainerSize = "default" | "narrow" | "wide";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: ContainerSize;
}

const sizeStyles: Record<ContainerSize, string> = {
  default: "max-w-content",
  narrow: "max-w-narrow",
  wide: "max-w-wide",
};

export default function Container({ children, size = "default", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeStyles[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
