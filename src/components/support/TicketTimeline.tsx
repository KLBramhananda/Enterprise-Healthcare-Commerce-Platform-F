import { CheckCircle, Clock, Circle } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Ticket } from "@/types/support";

function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

const TIMELINE_STEPS = ["open", "in_progress", "waiting_customer", "resolved", "closed"] as const;

export default function TicketTimeline({ ticket }: { ticket: Ticket }) {
  const currentIndex = TIMELINE_STEPS.indexOf(ticket.status);

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isFuture = idx > currentIndex;

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", isCompleted && "bg-success-100", isCurrent && "bg-brand-100", isFuture && "bg-surface-100")}>
                {isCompleted ? <CheckCircle size={14} className="text-success-600" /> : isCurrent ? <Clock size={14} className="text-brand-600" /> : <Circle size={14} className="text-surface-300" />}
              </div>
              {idx < TIMELINE_STEPS.length - 1 && <div className={cn("w-0.5 flex-1 my-1", isCompleted ? "bg-success-200" : "bg-surface-200")} />}
            </div>
            <div className="pb-4">
              <p className={cn("text-xs font-semibold capitalize", isCurrent ? "text-brand-700" : isCompleted ? "text-surface-700" : "text-surface-400")}>{step.replace(/_/g, " ")}</p>
              {isCurrent && ticket.updatedAt && <p className="mt-0.5 text-[10px] text-surface-400">{formatTimestamp(ticket.updatedAt)}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
