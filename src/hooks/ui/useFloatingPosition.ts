/**
 * useFloatingPosition
 *
 * Reusable positioning logic for floating layers (popovers, menus,
 * tooltips, autocomplete dropdowns).
 *
 * Core contract:
 *   - Positions the floating content using `position: fixed`. Coordinates are
 *     resolved from the anchor's viewport rect (getBoundingClientRect), so
 *     positioning survives page scrolling and never depends on — nor is
 *     clipped by — any ancestor's overflow/transform/stacking context.
 *   - The anchor is supplied as a ref object (RefObject<HTMLElement|null>).
 *     This supports both an internally owned trigger and an externally managed
 *     element (e.g. a header utility button) without any global state.
 *   - Repositions on window scroll/resize and whenever the anchor or content
 *     resizes, throttled to a single rAF per frame for performance.
 *   - Auto-flips to the opposite side when there is no room in the viewport,
 *     and clamps within viewport margins so content is never cut off.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export type FloatingPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end"
  | "right-start"
  | "right-end"
  | "left-start"
  | "left-end";

export interface FloatingPositionOptions {
  /** Preferred placement; may flip to the opposite side to stay in view. */
  placement?: FloatingPlacement;
  /** Gap (px) between the anchor and the floating content. */
  offset?: number;
  /** Match the floating content width to the anchor width (default false). */
  matchTriggerWidth?: boolean;
  /** Auto-flip to the opposite side when out of viewport (default true). */
  flip?: boolean;
  /** Minimum distance from viewport edges when clamping (px). */
  margin?: number;
}

export interface FloatingCoords {
  top: number;
  left: number;
  width?: number;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/** Compute fixed coordinates for floating content relative to the anchor rect. */
function computePosition(opts: {
  anchor: Rect;
  contentW: number;
  contentH: number;
  placement: FloatingPlacement;
  offset: number;
  margin: number;
  matchTriggerWidth: boolean;
  flip: boolean;
  viewportW: number;
  viewportH: number;
}): { coords: FloatingCoords; placement: FloatingPlacement } {
  let placement = opts.placement;

  if (opts.flip) {
    if (
      placement.startsWith("bottom") &&
      opts.anchor.top + opts.anchor.height + opts.offset + opts.contentH > opts.viewportH - opts.margin &&
      opts.anchor.top - opts.offset - opts.contentH > opts.margin
    ) {
      placement = ("top" + placement.slice("bottom".length)) as FloatingPlacement;
    } else if (
      placement.startsWith("top") &&
      opts.anchor.top - opts.offset - opts.contentH < opts.margin &&
      opts.anchor.top + opts.anchor.height + opts.offset + opts.contentH < opts.viewportH - opts.margin
    ) {
      placement = ("bottom" + placement.slice("top".length)) as FloatingPlacement;
    } else if (
      placement.startsWith("right") &&
      opts.anchor.left + opts.anchor.width + opts.offset + opts.contentW > opts.viewportW - opts.margin &&
      opts.anchor.left - opts.offset - opts.contentW > opts.margin
    ) {
      placement = ("left" + placement.slice("right".length)) as FloatingPlacement;
    } else if (
      placement.startsWith("left") &&
      opts.anchor.left - opts.offset - opts.contentW < opts.margin &&
      opts.anchor.left + opts.anchor.width + opts.offset + opts.contentW < opts.viewportW - opts.margin
    ) {
      placement = ("right" + placement.slice("left".length)) as FloatingPlacement;
    }
  }

  let top: number;
  let left: number;

  const trackVertical = placement.startsWith("bottom") || placement.startsWith("top");
  if (trackVertical) {
    top = placement.startsWith("bottom")
      ? opts.anchor.top + opts.anchor.height + opts.offset
      : opts.anchor.top - opts.offset - opts.contentH;

    if (opts.matchTriggerWidth) {
      left = opts.anchor.left;
    } else if (placement.endsWith("end")) {
      left = opts.anchor.left + opts.anchor.width - opts.contentW;
    } else {
      left = opts.anchor.left;
    }
  } else {
    if (placement.endsWith("start")) {
      top = opts.anchor.top;
    } else if (placement.endsWith("end")) {
      top = opts.anchor.top + opts.anchor.height - opts.contentH;
    } else {
      top = opts.anchor.top + (opts.anchor.height - opts.contentH) / 2;
    }

    left = placement.startsWith("right")
      ? opts.anchor.left + opts.anchor.width + opts.offset
      : opts.anchor.left - opts.offset - opts.contentW;
  }

  const width = opts.matchTriggerWidth ? opts.anchor.width : undefined;
  const w = width ?? opts.contentW;

  top = clamp(top, opts.margin, Math.max(opts.margin, opts.viewportH - opts.contentH - opts.margin));
  left = clamp(left, opts.margin, Math.max(opts.margin, opts.viewportW - w - opts.margin));

  return { coords: { top, left, width }, placement };
}

export function useFloatingPosition({
  open,
  anchorRef,
  placement = "bottom-start",
  offset = 8,
  matchTriggerWidth = false,
  flip = true,
  margin = 8,
}: FloatingPositionOptions & {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
}) {
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<FloatingCoords | null>(null);
  const [resolvedPlacement, setResolvedPlacement] = useState<FloatingPlacement>(placement);

  const reposition = useCallback(() => {
    const anchorEl = anchorRef.current;
    const floatingEl = floatingRef.current;
    if (!anchorEl || !floatingEl) return;

    const anchorRect = anchorEl.getBoundingClientRect();
    const contentW = floatingEl.offsetWidth || floatingEl.getBoundingClientRect().width;
    const contentH = floatingEl.offsetHeight || floatingEl.getBoundingClientRect().height;

    const { coords: next, placement: resolved } = computePosition({
      anchor: {
        top: anchorRect.top,
        left: anchorRect.left,
        width: anchorRect.width,
        height: anchorRect.height,
      },
      contentW,
      contentH,
      placement,
      offset,
      margin,
      matchTriggerWidth,
      flip,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
    });

    setCoords(next);
    setResolvedPlacement(resolved);
  }, [anchorRef, placement, offset, margin, matchTriggerWidth, flip]);

  // Reposition as soon as the content mounts (after layout, before paint) so
  // there is never a flash at the origin.
  useLayoutEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => reposition());
    return () => cancelAnimationFrame(id);
  }, [open, reposition]);

  // Reposition on viewport scroll/resize and anchor/content size changes,
  // throttled to a single rAF per frame.
  useEffect(() => {
    if (!open) return;
    let frame = 0;
    let disposed = false;

    const trigger = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!disposed) reposition();
      });
    };

    const anchorEl = anchorRef.current;
    const floatingEl = floatingRef.current;

    window.addEventListener("scroll", trigger, { capture: true, passive: true });
    window.addEventListener("resize", trigger);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(trigger);
      if (anchorEl) resizeObserver.observe(anchorEl);
      if (floatingEl) resizeObserver.observe(floatingEl);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", trigger, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", trigger);
      resizeObserver?.disconnect();
    };
  }, [open, reposition, anchorRef]);

  return { floatingRef, coords, resolvedPlacement, reposition };
}
