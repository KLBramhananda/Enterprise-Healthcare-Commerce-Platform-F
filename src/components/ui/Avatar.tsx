/**
 * Avatar
 *
 * User avatar with initials fallback.
 * All styles reference design tokens from tokens.css.
 */

import { cn } from "@/utils/cn";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export default function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white",
        sizeStyles[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
