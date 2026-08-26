import { cn } from "@/utils/cn";
import type { TicketPriority } from "@/types/support";

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  low: "bg-surface-100 text-surface-600",
  medium: "bg-info-50 text-info-700",
  high: "bg-warning-50 text-warning-700",
  urgent: "bg-danger-50 text-danger-700",
};

export default function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", PRIORITY_STYLES[priority])}>
      {priority}
    </span>
  );
}
