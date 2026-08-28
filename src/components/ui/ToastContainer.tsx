/**
 * ToastContainer
 *
 * Renders active toast notifications with optional action buttons.
 * All styles reference design tokens from tokens.css.
 */

import { X } from "lucide-react";
import { useToast, type ToastVariant } from "@/providers/ToastProvider";
import { cn } from "@/utils/cn";

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-success-50 text-success-800 border-success-100",
  error: "bg-danger-50 text-danger-800 border-danger-100",
  warning: "bg-warning-50 text-warning-800 border-warning-100",
  info: "bg-info-50 text-info-800 border-info-100",
};

const actionStyles: Record<ToastVariant, string> = {
  success: "text-success-700 hover:text-success-900",
  error: "text-danger-700 hover:text-danger-900",
  warning: "text-warning-700 hover:text-warning-900",
  info: "text-info-700 hover:text-info-900",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-toast flex flex-col gap-2"
      role="status"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg",
            "animate-[slideInRight_var(--duration-normal)_ease-out]",
            variantStyles[toast.variant],
          )}
        >
          <span className="text-sm">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action!.onClick();
                removeToast(toast.id);
              }}
              className={cn(
                "shrink-0 text-sm font-medium underline underline-offset-2 transition-colors",
                actionStyles[toast.variant],
              )}
            >
              {toast.action.label}
            </button>
          )}
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="ml-2 shrink-0 opacity-60 transition-opacity hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
