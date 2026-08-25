/**
 * QuantitySelector
 *
 * Accessible quantity selector with +/- buttons and min/max bounds.
 */

import { Minus, Plus } from "lucide-react";
import { cn } from "@/utils/cn";

interface QuantitySelectorProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
}: QuantitySelectorProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-surface-200 bg-surface-0",
        disabled && "opacity-50",
        className,
      )}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center rounded-l-lg text-surface-500 transition-colors duration-fast hover:bg-surface-50 hover:text-surface-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:text-surface-300"
      >
        <Minus size={14} />
      </button>
      <span
        className="flex h-9 w-12 items-center justify-center border-x border-surface-200 text-sm font-semibold text-surface-900"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center rounded-r-lg text-surface-500 transition-colors duration-fast hover:bg-surface-50 hover:text-surface-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:text-surface-300"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
