/**
 * OrdersPage
 *
 * Order history page displaying all placed orders.
 */

import { Link } from "react-router-dom";
import { Package, ShoppingBag } from "lucide-react";
import { Container, EmptyState, Badge, Loading } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useOrderHistory } from "@/hooks/checkout/useCheckout";
import { formatCurrency } from "@/utils/formatters";

const STATUS_VARIANTS: Record<string, "success" | "warning" | "info" | "danger"> = {
  placed: "info",
  confirmed: "info",
  processing: "warning",
  shipped: "warning",
  delivered: "success",
  cancelled: "danger",
};

export default function OrdersPage() {
  usePageTitle("My Orders");
  const { data: orders, isLoading } = useOrderHistory();

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "My Orders" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            My Orders
          </h1>
        </header>

        <div className="mt-6">
          {isLoading ? (
            <Loading message="Loading orders..." />
          ) : !orders || orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Your order history will appear here after you place your first order."
              action={
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  <ShoppingBag size={16} className="mr-2" />
                  Start Shopping
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}/confirmation`}
                  className="block rounded-xl border border-surface-200 bg-surface-0 p-5 transition-all hover:border-surface-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-brand-600" />
                        <span className="text-sm font-semibold text-surface-900">{order.id}</span>
                        <Badge variant={STATUS_VARIANTS[order.status]}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-surface-500">
                        {new Date(order.placedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        &middot; {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-base font-bold text-brand-700">
                      {formatCurrency(order.grandTotal)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
