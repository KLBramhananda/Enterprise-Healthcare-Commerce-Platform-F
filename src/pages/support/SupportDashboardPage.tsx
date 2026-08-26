import { Container, Card, CardBody, Badge } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks";
import SupportActivityItem from "@/components/support/SupportActivityItem";
import { useSupportStats, useSupportActivity, useTickets } from "@/hooks/support";
import { Ticket, MessageSquare, Clock, CheckCircle } from "lucide-react";

export default function SupportDashboardPage() {
  usePageTitle("Support Dashboard");
  const { data: stats } = useSupportStats();
  const { data: activity = [] } = useSupportActivity();
  const { data: tickets = [] } = useTickets();

  const statCards = [
    { label: "Open Tickets", value: stats?.openTickets ?? 0, icon: Ticket, color: "bg-info-50 text-info-600" },
    { label: "Resolved Tickets", value: stats?.resolvedTickets ?? 0, icon: CheckCircle, color: "bg-success-50 text-success-600" },
    { label: "Pending Returns", value: stats?.pendingReturns ?? 0, icon: Clock, color: "bg-warning-50 text-warning-600" },
    { label: "Pending Refunds", value: stats?.pendingRefunds ?? 0, icon: MessageSquare, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Support Dashboard" }]} />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">Support Dashboard</h1>
          <p className="mt-1 text-sm text-surface-500">Overview of your support activity.</p>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-surface-500">{s.label}</p>
                      <p className="text-xl font-bold text-surface-900">{s.value}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-sm font-bold text-surface-900">Recent Activity</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-surface-400">No recent activity.</p>
            ) : (
              <div className="divide-y divide-surface-100 rounded-xl border border-surface-200 bg-surface-0 px-5">
                {activity.map((a) => <SupportActivityItem key={a.id} activity={a} />)}
              </div>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-sm font-bold text-surface-900">Open Tickets</h2>
            {tickets.filter((t) => t.status === "open" || t.status === "in_progress").length === 0 ? (
              <p className="text-sm text-surface-400">All caught up!</p>
            ) : (
              <div className="space-y-2">
                {tickets.filter((t) => t.status === "open" || t.status === "in_progress").slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 px-4 py-3">
                    <span className="text-xs font-mono text-surface-400">{t.id}</span>
                    <p className="flex-1 truncate text-sm font-medium text-surface-900">{t.subject}</p>
                    <Badge variant={t.status === "in_progress" ? "info" : "default"}>{t.status.replace(/_/g, " ")}</Badge>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}
