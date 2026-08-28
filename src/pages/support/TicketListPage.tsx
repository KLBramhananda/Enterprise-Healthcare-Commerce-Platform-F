import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Container, Button, EmptyState } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks";
import TicketCard from "@/components/support/TicketCard";
import { useTickets } from "@/hooks/support";

export default function TicketListPage() {
  usePageTitle("My Tickets");
  const { data: tickets = [], isLoading } = useTickets();

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Help Center", path: "/help" }, { label: "My Tickets" }]} />

        <header className="mt-4 flex flex-col gap-4 border-b border-surface-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">My Tickets</h1>
            <p className="mt-1 text-sm text-surface-500">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
          </div>
          <Link to="/help/tickets/new">
            <Button><Plus size={16} className="mr-1.5 inline" />Raise a Ticket</Button>
          </Link>
        </header>

        <div className="mt-6">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-surface-400">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <EmptyState
              title="No tickets yet"
              description="When you raise a support ticket, it will appear here."
              action={<Link to="/help/tickets/new"><Button>Raise a Ticket</Button></Link>}
            />
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
