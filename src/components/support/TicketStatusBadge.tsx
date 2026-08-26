import { cn } from "@/utils/cn";
import type { TicketStatus } from "@/types/support";

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: "bg-blue-50 text-blue-700",
  in_progress: "bg-warning-50 text-warning-700",
  waiting_customer: "bg-purple-50 text-purple-700",
  resolved: "bg-success-50 text-success-700",
  closed: "bg-surface-100 text-surface-500",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open", in_progress: "In Progress", waiting_customer: "Waiting", resolved: "Resolved", closed: "Closed",
};

export default function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
