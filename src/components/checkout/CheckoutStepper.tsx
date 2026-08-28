/**
 * CheckoutStepper
 *
 * Multi-step progress indicator for the checkout wizard.
 * Completed steps show a check, the active step is highlighted, and future
 * steps are muted. Scrollable/horizontal on small screens.
 */

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

export interface CheckoutStepperStep {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface CheckoutStepperProps {
  steps: CheckoutStepperStep[];
  currentId: string;
  completedIds: string[];
  onStepClick?: (id: string) => void;
  className?: string;
}

export default function CheckoutStepper({
  steps,
  currentId,
  completedIds,
  onStepClick,
  className,
}: CheckoutStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentId);

  return (
    <ol
      aria-label="Checkout progress"
      className={cn(
        "flex items-start gap-2 overflow-x-auto py-2",
        className,
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = completedIds.includes(step.id);
        const isCurrent = step.id === currentId;
        const isReachable = index <= currentIndex || isCompleted;
        const Icon = step.icon;

        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-start gap-2 last:flex-none">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={!onStepClick}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
                  !onStepClick && "cursor-default",
                  isCompleted && "bg-brand-600 text-white",
                  isCurrent && "bg-brand-600 text-white ring-4 ring-brand-100",
                  !isCompleted && !isCurrent && "bg-surface-200 text-surface-500",
                  onStepClick && isReachable && "hover:ring-2 hover:ring-brand-200",
                )}
              >
                {isCompleted ? (
                  <Check size={16} aria-label="Completed" />
                ) : (
                  <Icon size={16} />
                )}
              </button>

              <span
                className={cn(
                  "mt-1.5 hidden text-center text-[11px] font-medium leading-tight sm:block",
                  isCurrent ? "text-brand-700" : isCompleted ? "text-surface-900" : "text-surface-400",
                )}
              >
                {step.label}
              </span>
              <span
                className={cn(
                  "mt-1.5 text-[10px] font-medium leading-tight sm:hidden",
                  isCurrent ? "text-brand-700" : "text-surface-400",
                )}
              >
                {isCompleted ? step.label : isCurrent ? step.label : index + 1}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                aria-hidden="true"
                className={cn(
                  "mt-4 h-0.5 min-w-4 flex-1 rounded-full",
                  completedIds.includes(step.id) ? "bg-brand-500" : "bg-surface-200",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}