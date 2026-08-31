/**
 * Popover
 *
 * The application's standard floating-layer primitive. All floating UI
 * (menus, listboxes, autocomplete panels, tooltips, mega-menus) should be
 * built on this component so behaviour stays consistent across the platform.
 *
 * Why this exists (the architecture fix):
 *   - Floating content is rendered through a React Portal into `document.body`
 *     with `position: fixed`. This escapes every ancestor stacking context and
 *     any clipping ancestor (`overflow: hidden`, `transform`, `filter`,
 *     `perspective`, `contain`, etc.) — solving the "dropdown hidden behind
 *     page content / sticky navs / banners" class of bug without z-index hacks.
 *   - Positioning is computed from the anchor's viewport rect and re-synced
 *     on scroll/resize/layout change, flipping and clamping to the viewport.
 *   - The portal mounts at the shared `z-popover` layer (above content, sticky
 *     headers, and drawers; below toasts), defined in the design tokens.
 *
 * Anchor modes:
 *   - `trigger`: an element rendered inline by the Popover (cloned to inject
 *     the toggle handler and ARIA). Ideal when the trigger and content belong
 *     to the same component (e.g. Language Selector).
 *   - `anchorRef`: an externally managed element (e.g. a header utility
 *     button). The Popover only renders the floating content; the owning
 *     component controls open/close. Ideal for the Notification / Profile
 *     menus whose triggers are owned by the header.
 *
 * Behaviour: open on click, close on outside click / Escape, focus management
 * with return-focus on close, Arrow/Home/End keyboard navigation for
 * listbox/menu roles, and a focus trap for dialog role.
 */

import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useFloatingPosition, type FloatingPlacement } from "@/hooks/ui";
import { cn } from "@/utils/cn";

type PopoverRole = "listbox" | "menu" | "dialog" | "tooltip";

interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Internal anchor rendered inline by this component. Mutually exclusive with `anchorRef`. */
  trigger?: ReactNode;
  /** External anchor element (its ref is owned by the consumer). */
  anchorRef?: RefObject<HTMLElement | null>;
  placement?: FloatingPlacement;
  offset?: number;
  matchTriggerWidth?: boolean;
  flip?: boolean;
  /** Offset the popover from the viewport edges when clamped (px). */
  margin?: number;
  /**
   * Render as a full-width sheet anchored below the trigger (mobile top
   * sheet use-case). See `FloatingPositionOptions.sheet`.
   */
  sheet?: boolean;
  maxHeight?: string;
  role?: PopoverRole;
  /** Accessible label/heading for dialog / listbox / menu (sets aria-label). */
  ariaLabel?: string;
  focusOnOpen?: boolean;
  returnFocusOnClose?: boolean;
  /** Trap tab focus (applied when role === "dialog"). */
  trapFocus?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  /** Extra classes applied to the floating panel. */
  className?: string;
  /** Content. May use the render function form to access `close()`. */
  children: ReactNode | ((ctx: { close: () => void }) => ReactNode);
}

interface FloatingProps {
  style: React.CSSProperties;
  role?: string;
  "aria-modal"?: boolean;
  "aria-label"?: string;
  tabIndex?: number;
  onKeyDown?: (e: ReactKeyboardEvent) => void;
  onMouseDown?: (e: ReactMouseEvent) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export default function Popover({
  open,
  onOpenChange,
  trigger,
  anchorRef,
  placement = "bottom-start",
  offset = 8,
  matchTriggerWidth = false,
  flip = true,
  margin = 8,
  sheet = false,
  maxHeight,
  role = "menu",
  ariaLabel,
  focusOnOpen = true,
  returnFocusOnClose = true,
  trapFocus = true,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  className,
  children,
}: PopoverProps) {
  const internalTriggerRef = useRef<HTMLElement | null>(null);
  // Resolve the anchor: an internally owned trigger, or the external anchorRef.
  const anchor = trigger ? internalTriggerRef : (anchorRef ?? internalTriggerRef);

  const prevFocusRef = useRef<HTMLElement | null>(null);
  const generatedId = useId();
  const contentId = `popover-${generatedId}`;

  // The floating element ref is owned by useFloatingPosition: the hook measures
  // the portal content through it to resolve coordinates. Attaching this same
  // ref to the portal div keeps the hook's measurements and this component's
  // outside-click / focus logic pointing at the same DOM node.
  const { coords, floatingRef } = useFloatingPosition({
    open,
    anchorRef: anchor,
    placement,
    offset,
    matchTriggerWidth,
    flip,
    margin,
    sheet,
  });

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const setTriggerRef = useCallback((node: HTMLElement | null) => {
    internalTriggerRef.current = node;
  }, []);

  // ── Outside click (mouse + touch for mobile) ──
  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;

    const isOutside = (target: Node | null) => {
      if (!target) return true;
      // Never steal interactions from modals/dialogs (e.g. a mobile Drawer
      // hosted in the same component). The dialog manages its own close.
      if (target instanceof Element && target.closest("[role='dialog']")) return false;
      const insideAnchor = anchor.current?.contains(target) ?? false;
      const insideFloat = floatingRef.current?.contains(target) ?? false;
      return !insideAnchor && !insideFloat;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (isOutside(e.target as Node)) close();
    };

    // Mobile: touchstart is more reliable than mousedown for outside-click on
    // iOS/Android browsers where mousedown may not fire before focus shifts.
    let touchTarget: Node | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchTarget = e.target as Node;
    };
    const onTouchEnd = (e: TouchEvent) => {
      // Prefer the changedTouch for accuracy; fall back to touchTarget.
      const target =
        (e.changedTouches[0] && document.elementFromPoint(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY,
        )) ?? touchTarget;
      if (isOutside(target)) close();
      touchTarget = null;
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [open, closeOnOutsideClick, close, anchor, floatingRef]);

  // ── Escape ──
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, close]);

  // ── Store prev focus + focus management on open ──
  useLayoutEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;

    const floatEl = floatingRef.current;
    if (!floatEl) return;

    if (role === "dialog" && trapFocus) {
      floatEl.focus({ preventScroll: true });
    } else if (focusOnOpen) {
      const focusables = getFocusable(floatEl);
      if (focusables.length > 0) focusables[0].focus({ preventScroll: true });
      else floatEl.focus({ preventScroll: true });
    }
  }, [open, role, trapFocus, focusOnOpen, floatingRef]);

  // ── Return focus on close ──
  useEffect(() => {
    if (open) return;
    const prev = prevFocusRef.current;
    if (returnFocusOnClose && prev?.isConnected) {
      prev.focus({ preventScroll: true });
    }
    prevFocusRef.current = null;
  }, [open, returnFocusOnClose]);

  // ── Focus trap (dialog) ──
  useEffect(() => {
    if (!open || role !== "dialog" || !trapFocus) return;
    const floatEl = floatingRef.current;
    if (!floatEl) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = getFocusable(floatEl);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    floatEl.addEventListener("keydown", onKey);
    return () => floatEl.removeEventListener("keydown", onKey);
  }, [open, role, trapFocus, floatingRef]);

  // ── Keyboard navigation for listbox / menu ──
  const handleContentKeyDown = (e: ReactKeyboardEvent) => {
    if (role !== "listbox" && role !== "menu") return;
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();

    const floatEl = floatingRef.current;
    const focusables = floatEl ? getFocusable(floatEl) : [];
    if (focusables.length === 0) return;

    const currentIdx = focusables.indexOf(document.activeElement as HTMLElement);
    let nextIdx = 0;
    if (e.key === "ArrowDown") nextIdx = (currentIdx + 1) % focusables.length;
    else if (e.key === "ArrowUp") nextIdx = (currentIdx - 1 + focusables.length) % focusables.length;
    else if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = focusables.length - 1;

    focusables[nextIdx].focus({ preventScroll: true });
  };

  const renderAnchor = () => {
    if (trigger == null) return null;

    type CloneableProps = HTMLAttributes<HTMLElement> & { ref?: unknown };

    const cloned = cloneElement(trigger as ReactElement<CloneableProps>, {
      "aria-expanded": open,
      "aria-haspopup": role === "tooltip" ? undefined : role,
      "aria-controls": open ? contentId : undefined,
      onClick: (e: ReactMouseEvent<HTMLElement>) => {
        const original = (
          trigger as ReactElement<{ onClick?: (ev: ReactMouseEvent<HTMLElement>) => void }>
        ).props.onClick;
        original?.(e);
        onOpenChange(!open);
      },
    });

    // Wrap the trigger in a span carrying the anchor ref. Injecting the ref
    // through cloneElement is not recognized as a ref by the React Compiler
    // lint rules, so the wrapper is used instead. The wrapper is inline, so it
    // does not disturb the trigger's layout, and its viewport rect matches the
    // trigger's for positioning purposes.
    return <span ref={setTriggerRef}>{cloned}</span>;
  };

  const floatingProps: FloatingProps = {
    style: {
      position: "fixed",
      top: coords?.top ?? 0,
      left: coords?.left ?? 0,
      width: coords?.width,
      maxHeight: maxHeight ?? undefined,
      visibility: coords ? "visible" : "hidden",
      pointerEvents: coords ? "auto" : "none",
    },
    onKeyDown: handleContentKeyDown,
  };

  if (role === "dialog") {
    floatingProps.role = "dialog";
    floatingProps["aria-modal"] = trapFocus;
    floatingProps.tabIndex = -1;
  } else {
    floatingProps.role = role; // listbox | menu | tooltip
  }
  floatingProps["aria-label"] = ariaLabel;

  const contentElement =
    typeof children === "function" ? children({ close }) : children;

  const floatingContent = open ? (
    <div
      ref={floatingRef}
      id={contentId}
      role={floatingProps.role}
      aria-modal={floatingProps["aria-modal"]}
      aria-label={floatingProps["aria-label"]}
      tabIndex={floatingProps.tabIndex}
      onKeyDown={floatingProps.onKeyDown}
      style={floatingProps.style}
      className={cn(
        "z-popover rounded-xl border border-surface-200 bg-surface-0 shadow-lg",
        maxHeight ? "overflow-y-auto" : "overflow-hidden",
        sheet &&
          "w-full max-w-none rounded-none rounded-b-2xl border-x-0 border-t-0 shadow-xl",
        className,
      )}
    >
      {contentElement}
    </div>
  ) : null;

  // The positioning hook repositions on open (rAF after mount) and on
  // scroll/resize/anchor/content size changes via ResizeObserver.

  const portal = floatingContent
    ? createPortal(floatingContent, document.body)
    : null;

  return (
    <>
      {renderAnchor()}
      {portal}
    </>
  );
}
