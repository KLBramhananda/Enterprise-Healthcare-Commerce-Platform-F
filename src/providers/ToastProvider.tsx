/**
 * Toast Provider
 *
 * Lightweight notification system for user feedback.
 * Supports optional action buttons and deduplication via keys.
 */

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
  deduplicateKey?: string;
}

interface AddToastOptions {
  action?: ToastAction;
  deduplicateKey?: string;
}

export type AddToastFn = (
  message: string,
  variant?: ToastVariant,
  options?: AddToastOptions,
) => string;

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant, options?: AddToastOptions) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", options?: AddToastOptions): string => {
      if (options?.deduplicateKey) {
        const duplicate = toasts.find((t) => t.deduplicateKey === options.deduplicateKey);
        if (duplicate) {
          return duplicate.id;
        }
      }

      const id = `toast-${++toastCounter}`;
      setToasts((prev) => [
        ...prev,
        { id, message, variant, action: options?.action, deduplicateKey: options?.deduplicateKey },
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
      return id;
    },
    [toasts],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
