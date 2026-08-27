/**
 * Modal
 *
 * The application's standard modal dialog component. All dialogs in the app
 * should be built on this primitive so layering, spacing, responsiveness, and
 * accessibility stay consistent everywhere.
 *
 * Why this is the production-grade standard:
 *   - Rendered through a React Portal into `document.body` with
 *     `position: fixed`, so it escapes every ancestor stacking context and is
 *     guaranteed to sit above all page components (sticky navs, floating
 *     panels, sidebars, drawers, overlays) at the shared `z-modal` layer.
 *   - Full-screen backdrop dims the page behind it.
 *   - Locks background scrolling while open and restores it on close.
 *   - Traps keyboard focus inside the dialog (Tab cycles, Shift+Tab wraps).
 *   - Captures the triggering element's focus on open and restores it on
 *     close.
 *   - Closes via the close button, the Escape key, or a backdrop click.
 *   - Proper ARIA: `role="dialog"`, `aria-modal="true"`,
 *     `aria-labelledby` (title header).
 *
 * Layout contract:
 *   - The dialog is vertically centered with viewport margins on every screen.
 *   - The outer wrapper uses responsive padding so the dialog never touches
 *     the edges of the viewport on smaller screens (safe-area friendly).
 *   - `max-h-full` + `overflow-y-auto` on the body keeps the header and footer
 *     actions visible while the content scrolls internally for large forms —
 *     the whole page is never shifted to make room for the dialog.
 *   - Responsive maximum widths via `size` (sm/md/lg/xl/full).
 *
 * API note: `className` is appended to the dialog card itself so consumers can
 * tune width/padding for a specific form without changing the shared behaviour.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const SIZE_STYLES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
  xl: "max-w-3xl",
  full: "max-w-full",
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Dialog width. Defaults to `md`. */
  size?: ModalSize;
  className?: string;
  /** Disable closing on backdrop click (default false). */
  closeOnBackdropClick?: boolean;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
  closeOnBackdropClick = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isOpenRef = useRef(isOpen);
  const titleId = useId();

  // Keep a ref so the focus trap / keydown handlers always read current state.
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // ── Body scroll lock + capture trigger focus on open ──
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ── Initial focus: move focus into the dialog once mounted ──
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    panelRef.current.focus({ preventScroll: true });
  }, [isOpen]);

  // ── Escape key: close (stopPropagation so it does not bubble to other
  //    document-level handlers) ──
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // ── Focus trap: keep Tab within the dialog ──
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const panel = panelRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (!isOpenRef.current) return;
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || !panel.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else if (
        document.activeElement === last ||
        !panel.contains(document.activeElement)
      ) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // ── Restore focus to the triggering element on close ──
  useEffect(() => {
    if (!isOpen) {
      const prev = previousFocusRef.current;
      if (prev?.isConnected) prev.focus({ preventScroll: true });
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick) return;
    onClose();
  }, [closeOnBackdropClick, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center p-3 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-full w-full flex-col overflow-hidden rounded-xl bg-surface-0 shadow-xl focus:outline-none",
          SIZE_STYLES[size],
          className,
        )}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-surface-200 px-5 py-4 sm:px-6">
            <h2 id={titleId} className="text-lg font-semibold text-surface-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Scrollable body — header stays fixed, actions stay reachable */}
        <div className="overflow-y-auto overscroll-contain p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
