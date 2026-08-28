import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui";
import TicketStatusBadge from "./TicketStatusBadge";
import TicketPriorityBadge from "./TicketPriorityBadge";
import type { Ticket } from "@/types/support";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const CATEGORY_LABELS: Record<string, string> = {
  order_issue: "Order Issue", delivery: "Delivery", payment: "Payment", prescription: "Prescription",
  product: "Product", account: "Account", technical: "Technical", other: "Other",
};

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link to={`/help/tickets/${ticket.id}`}>
      <div className="flex items-center gap-4 rounded-xl border border-surface-200 bg-surface-0 p-4 transition-all hover:shadow-sm hover:border-brand-200">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-surface-400">{ticket.id}</span>
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
          <h3 className="mt-1.5 text-sm font-semibold text-surface-900 truncate">{ticket.subject}</h3>
          <div className="mt-2 flex items-center gap-3 text-xs text-surface-400">
            <Badge variant="default">{CATEGORY_LABELS[ticket.category] ?? ticket.category}</Badge>
            <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(ticket.updatedAt)}</span>
            <span>{ticket.messages.length} message{ticket.messages.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <ArrowRight size={16} className="shrink-0 text-surface-300" />
      </div>
    </Link>
  );
}
