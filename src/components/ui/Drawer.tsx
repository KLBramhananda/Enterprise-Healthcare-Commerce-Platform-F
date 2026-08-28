/**
 * Drawer
 *
 * Generic slide-in panel component. Renders via React Portal to escape
 * any stacking context. Supports left/right slide, custom header,
 * focus trap, Escape to close, backdrop click, and body scroll lock.
 *
 * Animation lifecycle:
 *   - The portal is always mounted when the parent renders <Drawer>.
 *   - Visibility is controlled via CSS opacity + pointer-events + translate,
 *     allowing the slide animation to play on both open and close.
 *   - The panel remains in the DOM during the close transition so
 *     translate-x can animate from 0 → full before the visual disappears.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** Custom header element. When provided, replaces the default title+close header. */
  header?: ReactNode;
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
  /**
   * Hide the drawer on sm+ viewports. Used when a desktop Popover already
   * serves the same content, to avoid rendering two overlays at once (which
   * would stack a full-screen backdrop and a second focus trap on desktop).
   */
  desktopHidden?: boolean;
}

type RenderPhase = "mounted" | "unmounted";

export function Drawer({
  isOpen,
  onClose,
  title,
  header,
  children,
  side = "right",
  className,
  desktopHidden = false,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpenRef = useRef(isOpen);

  // When `desktopHidden`, the drawer is only visible below `sm` (640px). Track
  // whether the current viewport hides it so its body scroll lock never fires
  // on larger viewports, where a matching Popover owns the UI. Without this,
  // a hidden drawer would still lock the document scroll and cause a
  // scrollbar-driven viewport width / layout shift.
  const [viewportHidesDrawer, setViewportHidesDrawer] = useState(
    () =>
      desktopHidden &&
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 640px)").matches,
  );

  // Keep the hidden-on-desktop state in sync across viewport resizes.
  useEffect(() => {
    if (!desktopHidden) return;
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setViewportHidesDrawer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [desktopHidden]);

  // Track the isOpen prop for the focus trap callback
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // ── Animation lifecycle (React 19 "adjusting state during rendering") ──
  // When isOpen transitions true→false, stay mounted for 300ms (the slide-out
  // transition duration), then unmount. When it transitions false→true,
  // mount immediately.
  const [renderPhase, setRenderPhase] = useState<RenderPhase>(
    isOpen ? "mounted" : "unmounted",
  );

  // Adjust state during render (not in effect) — lint-compliant
  if (isOpen && renderPhase === "unmounted") {
    setRenderPhase("mounted");
  }

  // Schedule unmount after close animation
  useEffect(() => {
    if (renderPhase === "mounted" && !isOpen) {
      closeTimerRef.current = setTimeout(() => setRenderPhase("unmounted"), 300);
      return () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      };
    }
  }, [isOpen, renderPhase]);

  // Save the element that had focus before the drawer opened
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    }
  }, [isOpen]);

  // Body scroll lock — skipped when a `desktopHidden` drawer is hidden on
  // sm+ viewports, so opening a desktop Popover never alters page scrolling,
  // the scrollbar, or the viewport width.
  useEffect(() => {
    if (!isOpen || (desktopHidden && viewportHidesDrawer)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, desktopHidden, viewportHidesDrawer]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const panel = panelRef.current;

    panel.focus({ preventScroll: true });

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (!isOpenRef.current) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    panel.addEventListener("keydown", handleTab);
    return () => panel.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Restore focus on close
  useEffect(() => {
    if (!isOpen && previousFocusRef.current instanceof HTMLElement) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (renderPhase === "unmounted") return null;

  const panelPosition = side === "right" ? "right-0" : "left-0";
  const translateOpen = "translate-x-0";
  const translateClosed = side === "right" ? "translate-x-full" : "-translate-x-full";

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-modal transition-opacity duration-300",
        desktopHidden && "sm:hidden",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Panel"}
        tabIndex={-1}
        className={cn(
          "absolute top-0 bottom-0 flex w-full max-w-md flex-col bg-surface-0 shadow-xl",
          "transition-transform duration-300",
          panelPosition,
          isOpen ? translateOpen : translateClosed,
          className,
        )}
      >
        {/* Header */}
        {header ??
          (title && (
            <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          ))}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
