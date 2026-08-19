/**
 * Select
 *
 * Reusable select dropdown component.
 */

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900",
            "focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
            "disabled:bg-slate-50 disabled:text-slate-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
