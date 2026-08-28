/**
 * ProductImage
 *
 * Reusable product image with loading skeleton, error fallback,
 * and placeholder SVG for missing images. Supports aspect ratios
 * for grid cards, list items, and detail views.
 */

import { useState } from "react";
import { cn } from "@/utils/cn";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspect?: "square" | "video" | "portrait";
  size?: "sm" | "md" | "lg";
  /** Use browser-native lazy loading (off-screen images). Defaults to false. */
  lazy?: boolean;
}

function PlaceholderIcon({ size }: { size: "sm" | "md" | "lg" }) {
  const dim = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("text-surface-300", dim[size])}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="6" y="16" width="36" height="16" rx="8" transform="rotate(-45 24 24)" />
      <line x1="17" y1="17" x2="31" y2="31" />
    </svg>
  );
}

export default function ProductImage({
  src,
  alt,
  className,
  aspect = "square",
  size = "md",
  lazy = false,
}: ProductImageProps) {
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "error">(
    src ? "loading" : "error",
  );

  // Derived state from props: reset image state when src changes
  // (e.g. different product variant) without an effect.
  const [lastSrc, setLastSrc] = useState(src);
  if (lastSrc !== src) {
    setLastSrc(src);
    setState(src ? "loading" : "error");
  }

  const aspectClass = aspect === "video" ? "aspect-video" : aspect === "portrait" ? "aspect-[3/4]" : "aspect-square";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg border border-surface-100 bg-surface-50",
        aspectClass,
        className,
      )}
    >
      {state === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-surface-200" />
      )}
      {src && state !== "error" ? (
        <img
          src={src}
          alt={alt}
          loading={lazy ? "lazy" : undefined}
          decoding="async"
          className={cn(
            "h-full w-full object-contain transition-opacity duration-normal",
            state === "loaded" ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
        />
      ) : (
        <PlaceholderIcon size={size} />
      )}
    </div>
  );
}
