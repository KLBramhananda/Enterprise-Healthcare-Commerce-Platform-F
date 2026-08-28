/**
 * Timeline
 *
 * Vertical timeline component for order status tracking.
 * All styles reference design tokens from tokens.css.
 */

import { Check, Clock, X, RotateCcw } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/formatters";

export interface TimelineEvent {
  type: string;
  label: string;
  timestamp: string;
  description?: string;
  isCurrent?: boolean;
  isCompleted?: boolean;
  isCancelled?: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

function getEventIcon(type: string, isCancelled?: boolean) {
  if (isCancelled) return <X size={14} />;
  if (type === "return_requested" || type === "return_approved" || type === "refund_processed") {
    return <RotateCcw size={14} />;
  }
  return <Check size={14} />;
}

export default function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {events.map((event, index) => (
        <div key={`${event.type}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Connector line */}
          {index < events.length - 1 && (
            <div
              className={cn(
                "absolute left-[15px] top-8 h-full w-0.5",
                event.isCompleted ? "bg-brand-300" : "bg-surface-200",
              )}
            />
          )}

          {/* Icon */}
          <div
            className={cn(
              "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              event.isCancelled
                ? "bg-danger-100 text-danger-700"
                : event.isCompleted
                  ? "bg-brand-100 text-brand-700"
                  : event.isCurrent
                    ? "bg-brand-600 text-white"
                    : "bg-surface-100 text-surface-400",
            )}
          >
            {event.isCurrent ? (
              <Clock size={14} />
            ) : (
              getEventIcon(event.type, event.isCancelled)
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-baseline justify-between gap-2">
              <p
                className={cn(
                  "text-sm font-medium",
                  event.isCurrent
                    ? "text-brand-700"
                    : event.isCompleted
                      ? "text-surface-900"
                      : "text-surface-500",
                )}
              >
                {event.label}
              </p>
              <span className="shrink-0 text-xs text-surface-400">
                {formatDate(event.timestamp, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {event.description && (
              <p className="mt-0.5 text-xs text-surface-500">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
