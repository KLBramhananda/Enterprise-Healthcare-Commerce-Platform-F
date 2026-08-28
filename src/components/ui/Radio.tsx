/**
 * Radio
 *
 * Standalone radio button component with label and optional description.
 * Follows the same design patterns as Input and CheckboxOption.
 */

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const radioId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <label
        htmlFor={radioId}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border border-surface-200 p-4 transition-all duration-fast ease-smooth",
          "hover:border-brand-300 hover:bg-brand-50/30",
          props.checked && "border-brand-500 bg-brand-50 ring-1 ring-brand-500",
          props.disabled && "cursor-not-allowed opacity-50 hover:border-surface-200 hover:bg-transparent",
          className,
        )}
      >
        <input
          ref={ref}
          id={radioId}
          type="radio"
          className="mt-0.5 h-4 w-4 shrink-0 border-surface-300 text-brand-600 focus:ring-brand-500/20"
          {...props}
        />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-surface-900">{label}</span>
          {description && (
            <p className="mt-0.5 text-xs text-surface-500">{description}</p>
          )}
        </div>
      </label>
    );
  },
);

Radio.displayName = "Radio";

export default Radio;
