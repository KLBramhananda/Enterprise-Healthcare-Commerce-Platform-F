import { Container, Card, CardBody, EmptyState } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks";
import { useReturnRequests, useRefundHistory } from "@/hooks/support";
import { Package, CreditCard } from "lucide-react";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const RETURN_STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning-50 text-warning-700",
  approved: "bg-success-50 text-success-700",
  rejected: "bg-danger-50 text-danger-700",
  received: "bg-info-50 text-info-700",
  refunded: "bg-surface-100 text-surface-600",
};

const REFUND_STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning-50 text-warning-700",
  processed: "bg-success-50 text-success-700",
  failed: "bg-danger-50 text-danger-700",
};

export default function ReturnsRefundsPage() {
  usePageTitle("Returns & Refunds");
  const { data: returnRequests = [] } = useReturnRequests();
  const { data: refundHistory = [] } = useRefundHistory();

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Help Center", path: "/help" }, { label: "Returns & Refunds" }]} />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">Returns & Refunds</h1>
          <p className="mt-1 text-sm text-surface-500">Manage your return requests and refund history.</p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-surface-900">
              <Package size={18} /> Return Requests
            </h2>
            {returnRequests.length === 0 ? (
              <EmptyState title="No return requests" description="You haven't initiated any returns yet." />
            ) : (
              <div className="space-y-3">
                {returnRequests.map((r) => (
                  <Card key={r.id}>
                    <CardBody>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-surface-900">{r.items[0]?.reason ?? "Return request"}</p>
                          <p className="mt-0.5 text-xs text-surface-400">Order: {r.orderId} • {formatDate(r.createdAt)}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${RETURN_STATUS_STYLES[r.status] ?? ""}`}>
                          {r.status}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-surface-900">
              <CreditCard size={18} /> Refund History
            </h2>
            {refundHistory.length === 0 ? (
              <EmptyState title="No refunds" description="No refund records yet." />
            ) : (
              <div className="space-y-3">
                {refundHistory.map((r) => (
                  <Card key={r.id}>
                    <CardBody>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-surface-900">₹{r.amount.toFixed(2)}</p>
                          <p className="mt-0.5 text-xs text-surface-400">{r.method} • {formatDate(r.completedAt ?? r.createdAt)}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${REFUND_STATUS_STYLES[r.status] ?? ""}`}>
                          {r.status}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}
