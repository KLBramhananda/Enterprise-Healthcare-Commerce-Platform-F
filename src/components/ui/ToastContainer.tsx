/**
 * ToastContainer
 *
 * Renders active toast notifications.
 */

import { X } from "lucide-react";
import { useToast, type ToastVariant } from "@/providers/ToastProvider";
import { cn } from "@/utils/cn";

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  error: "bg-red-50 text-red-800 border-red-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg",
            variantStyles[toast.variant],
          )}
        >
          <span className="text-sm">{toast.message}</span>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="ml-2 shrink-0 opacity-60 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
