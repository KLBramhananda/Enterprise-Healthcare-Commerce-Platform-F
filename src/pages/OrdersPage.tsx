import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingBag, Search, RefreshCw, ArrowRight, AlertCircle } from "lucide-react";
import { Container, Badge, Button, EmptyState, Tabs } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useOrderHistory } from "@/hooks/checkout/useCheckout";
import { useCart } from "@/hooks/shopping";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { OrderStatus, Order, Product } from "@/types";

const STATUS_VARIANTS: Record<OrderStatus, "success" | "warning" | "info" | "danger"> = {
  placed: "info",
  confirmed: "info",
  processing: "warning",
  shipped: "warning",
  delivered: "success",
  cancelled: "danger",
};

const STATUS_TABS: { id: string; label: string; filter: OrderStatus | "all" }[] = [
  { id: "all", label: "All", filter: "all" },
  { id: "placed", label: "Placed", filter: "placed" },
  { id: "confirmed", label: "Confirmed", filter: "confirmed" },
  { id: "processing", label: "Processing", filter: "processing" },
  { id: "shipped", label: "Shipped", filter: "shipped" },
  { id: "delivered", label: "Delivered", filter: "delivered" },
  { id: "cancelled", label: "Cancelled", filter: "cancelled" },
];

function getItemSummary(items: Order["items"]): string {
  if (items.length === 0) return "No items";
  if (items.length === 1) return items[0].product.name;
  if (items.length === 2) return `${items[0].product.name}, ${items[1].product.name}`;
  return `${items[0].product.name}, ${items[1].product.name} and ${items.length - 2} more`;
}

function handleReorder(order: Order, addItem: (product: Product, quantity?: number) => void) {
  order.items.forEach((item) => {
    addItem(item.product, item.quantity);
  });
}

export default function OrdersPage() {
  usePageTitle("My Orders");
  const { data: orders, isLoading, isError, refetch } = useOrderHistory();
  const { addItem } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const statusCounts = useMemo(() => {
    if (!orders) return {} as Record<string, number>;
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const tabs = useMemo(
    () =>
      STATUS_TABS.map((tab) => ({
        id: tab.id,
        label: tab.label,
        count: statusCounts[tab.filter === "all" ? "all" : tab.filter] ?? 0,
      })),
    [statusCounts],
  );

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) => {
      const matchesTab =
        activeTab === "all" || order.status === activeTab;
      const matchesSearch =
        searchQuery === "" ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

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
            <EmptyState
              title="Loading orders..."
              description="Please wait while we fetch your order history."
              action={<RefreshCw size={16} className="animate-spin" />}
            />
          ) : isError || !orders ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-danger-200 bg-danger-50 p-12 text-center">
              <AlertCircle size={40} className="text-danger-400" />
              <h2 className="mt-4 text-lg font-semibold text-surface-900">Failed to load orders</h2>
              <p className="mt-1 max-w-sm text-sm text-surface-500">
                We couldn't fetch your order history. Please check your connection and try again.
              </p>
              <Button onClick={() => refetch()} className="mt-5">
                <RefreshCw size={16} className="mr-2" />
                Try again
              </Button>
            </div>
          ) : orders.length === 0 ? (
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
            <div>
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search by order ID..."
                  aria-label="Search orders by order ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-surface-300 bg-surface-0 py-2 pl-9 pr-3 text-sm text-surface-900 placeholder-surface-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                {filteredOrders.length === 0 ? (
                  <EmptyState
                    title="No orders found"
                    description="Try adjusting your search or filter to find what you're looking for."
                  />
                ) : (
                  <div className="space-y-4 pt-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-xl border border-surface-200 bg-surface-0 p-5 transition-all hover:shadow-md"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Package size={16} className="text-brand-600" />
                              <span className="text-sm font-semibold text-surface-900">
                                {order.id}
                              </span>
                              <Badge variant={STATUS_VARIANTS[order.status]}>
                                {order.status}
                              </Badge>
                            </div>

                            <p className="mt-1 text-sm text-surface-500">
                              {formatDate(order.placedAt)}
                              &middot; {order.items.length} item
                              {order.items.length !== 1 ? "s" : ""}
                            </p>

                            <p className="mt-1 text-sm text-surface-600">
                              {getItemSummary(order.items)}
                            </p>

                            {order.status !== "cancelled" && order.status !== "delivered" && (
                              <p className="mt-1 text-xs text-surface-400">
                                Estimated delivery: {formatDate(order.estimatedDelivery)}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className="text-base font-bold text-brand-700">
                              {formatCurrency(order.grandTotal)}
                            </span>

                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReorder(order, addItem)}
                              >
                                <RefreshCw size={14} className="mr-1" />
                                Reorder
                              </Button>

                              <Link
                                to={`/orders/${order.id}`}
                                className="inline-flex items-center justify-center rounded-md border border-surface-300 bg-surface-0 px-2.5 py-1 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50"
                              >
                                View Details
                                <ArrowRight size={14} className="ml-1" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Tabs>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
