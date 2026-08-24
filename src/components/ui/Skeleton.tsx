/**
 * Skeleton
 *
 * Loading placeholder component with animated pulse effect.
 * Provides composable primitives for building skeleton screens.
 */

import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

/* ── Skeleton Base ── */

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-200", className)}
      {...props}
    />
  );
}

/* ── SkeletonText ── */

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3.5",
            i === lines - 1 ? "w-3/4" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

/* ── SkeletonImage ── */

interface SkeletonImageProps {
  className?: string;
  aspect?: "square" | "video" | "portrait";
}

const aspectStyles: Record<NonNullable<SkeletonImageProps["aspect"]>, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
};

function SkeletonImage({ className, aspect = "square" }: SkeletonImageProps) {
  return (
    <Skeleton
      className={cn("w-full rounded-xl", aspectStyles[aspect], className)}
    />
  );
}

/* ── SkeletonAvatar ── */

interface SkeletonAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const avatarSizes: Record<NonNullable<SkeletonAvatarProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

function SkeletonAvatar({ size = "md", className }: SkeletonAvatarProps) {
  return (
    <Skeleton
      className={cn("rounded-full", avatarSizes[size], className)}
    />
  );
}

/* ── SkeletonCard ── */

interface SkeletonCardProps {
  className?: string;
}

function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <SkeletonImage aspect="video" className="rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonImage, SkeletonAvatar, SkeletonCard };
export type { SkeletonProps, SkeletonTextProps, SkeletonImageProps, SkeletonAvatarProps, SkeletonCardProps };
