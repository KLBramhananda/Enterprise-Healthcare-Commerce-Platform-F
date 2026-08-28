/**
 * IconTile
 *
 * Reusable icon-in-circle component for promo cards, category tiles, and feature highlights.
 */

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type IconTileSize = "sm" | "md" | "lg";
type IconTileColor = "brand" | "blue" | "green" | "purple" | "amber" | "pink" | "orange" | "cyan";

interface IconTileProps {
  icon: ReactNode;
  size?: IconTileSize;
  color?: IconTileColor;
  className?: string;
}

const sizeStyles: Record<IconTileSize, { outer: string; inner: string }> = {
  sm: { outer: "h-10 w-10", inner: "h-10 w-10" },
  md: { outer: "h-12 w-12 sm:h-14 sm:w-14", inner: "h-12 w-12 sm:h-14 sm:w-14" },
  lg: { outer: "h-14 w-14 sm:h-16 sm:w-16", inner: "h-14 w-14 sm:h-16 sm:w-16" },
};

const colorStyles: Record<IconTileColor, string> = {
  brand: "bg-brand-100 text-brand-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  amber: "bg-amber-100 text-amber-600",
  pink: "bg-pink-100 text-pink-600",
  orange: "bg-orange-100 text-orange-600",
  cyan: "bg-cyan-100 text-cyan-600",
};

export default function IconTile({
  icon,
  size = "md",
  color = "brand",
  className,
}: IconTileProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        sizeStyles[size].outer,
        colorStyles[color],
        className,
      )}
    >
      {icon}
    </div>
  );
}
