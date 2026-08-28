/**
 * AnnouncementTicker
 *
 * Enterprise-style promotional announcement bar that scrolls messages
 * continuously from right to left.
 *
 * Behavior:
 *   - Seamless, GPU-accelerated marquee built on a transform-only CSS
 *     animation (no JS timers, no layout thrash) for smooth, performant
 *     scrolling.
 *   - Pauses when the user hovers the bar (group-hover animation-play-state).
 *   - Respects prefers-reduced-motion by disabling the animation and
 *     wrapping the messages as static text instead.
 *   - Responsive: messages remain readable across desktop, tablet, and
 *     mobile via the marquee.
 *
 * Accessibility:
 *   - The visual marquee is aria-hidden (decorative); the full set of
 *     announcements is provided to screen readers via a visually-hidden list,
 *     so content is never announced twice nor clipped from assistive tech.
 */

import { ANNOUNCEMENTS } from "@/config/constants";
import { cn } from "@/utils/cn";

interface AnnouncementTickerProps {
  announcements?: readonly string[];
  className?: string;
}

export default function AnnouncementTicker({
  announcements = ANNOUNCEMENTS,
  className,
}: AnnouncementTickerProps) {
  return (
    <div
      role="region"
      aria-label="Announcements"
      className={cn("group relative overflow-hidden bg-brand-600", className)}
    >
      {/* Screen-reader-only plain list of all announcements */}
      <ul className="sr-only">
        {announcements.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>

      {/* Visual marquee — decorative duplicate of the SR list */}
      <div
        aria-hidden="true"
        className={cn(
          "flex w-max",
          "motion-safe:animate-[announcement-ticker_30s_linear_infinite]",
          "group-hover:[animation-play-state:paused]",
          "motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:[animation:none]",
        )}
      >
        <MessageSet announcements={announcements} />
        <MessageSet announcements={announcements} duplicate />
      </div>
    </div>
  );
}

function MessageSet({
  announcements,
  duplicate = false,
  className,
}: {
  announcements: readonly string[];
  duplicate?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center whitespace-nowrap py-2",
        !duplicate && "motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:whitespace-normal",
        duplicate && "motion-reduce:hidden",
        className,
      )}
    >
      {announcements.map((message) => (
        <span key={message} className="flex items-center">
          <span className="text-xs font-medium text-white sm:text-[13px]">{message}</span>
          <span className="mx-4 text-brand-200/60 sm:mx-6" aria-hidden="true">
            •
          </span>
        </span>
      ))}
    </div>
  );
}
