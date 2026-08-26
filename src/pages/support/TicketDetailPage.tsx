import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Container, EmptyState, Badge } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";
import TicketPriorityBadge from "@/components/support/TicketPriorityBadge";
import TicketTimeline from "@/components/support/TicketTimeline";
import TicketConversation from "@/components/support/TicketConversation";
import TicketMessageInput from "@/components/support/TicketMessageInput";
import { useTicket } from "@/hooks/support";

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { data: ticket, isLoading, error } = useTicket(ticketId!);

  usePageTitle(ticket ? ticket.subject : "Ticket");

  const CATEGORY_LABELS: Record<string, string> = {
    order_issue: "Order Issue", delivery: "Delivery", payment: "Payment", prescription: "Prescription",
    product: "Product", account: "Account", technical: "Technical", other: "Other",
  };

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Help Center", path: "/help" },
            { label: "My Tickets", path: "/help/tickets" },
            { label: ticket ? ticket.subject : "Ticket" },
          ]}
        />

        <div className="mt-4">
          <Link to="/help/tickets" className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 hover:text-brand-600">
            <ArrowLeft size={14} /> Back to tickets
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-surface-400">Loading ticket...</div>
        ) : error || !ticket ? (
          <EmptyState title="Ticket not found" description="The ticket you're looking for doesn't exist or has been removed." />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-surface-400">{ticket.id}</span>
                      <TicketStatusBadge status={ticket.status} />
                      <TicketPriorityBadge priority={ticket.priority} />
                      <Badge variant="default">{CATEGORY_LABELS[ticket.category] ?? ticket.category}</Badge>
                    </div>
                    <h1 className="mt-2 text-lg font-bold text-surface-900">{ticket.subject}</h1>
                    <p className="mt-1 text-sm text-surface-500">{ticket.description}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <TicketConversation messages={ticket.messages} />
              </div>

              {ticket.status !== "closed" && ticket.status !== "resolved" && (
                <div className="mt-4">
                  <TicketMessageInput ticketId={ticket.id} />
                </div>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-surface-200 bg-surface-0 p-5">
                <h3 className="text-sm font-bold text-surface-900">Ticket Progress</h3>
                <div className="mt-4">
                  <TicketTimeline ticket={ticket} />
                </div>
                <div className="mt-6 space-y-3 border-t border-surface-100 pt-4 text-xs text-surface-500">
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span className="text-surface-700">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last updated</span>
                    <span className="text-surface-700">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {ticket.orderId && (
                    <div className="flex justify-between">
                      <span>Related order</span>
                      <Link to={`/orders/${ticket.orderId}`} className="font-medium text-brand-600 hover:underline">{ticket.orderId}</Link>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}
