/**
 * Textarea
 *
 * Reusable textarea component with label and error support.
 * Matches the Input component styling and patterns.
 */

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = textareaId ? `${textareaId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1 block text-sm font-medium text-surface-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-sm text-surface-900 placeholder-surface-400",
            "transition-colors duration-fast ease-smooth",
            "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
            "disabled:bg-surface-50 disabled:text-surface-500",
            error && "border-danger-600 focus:border-danger-600 focus:ring-danger-500/20",
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-xs text-danger-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
