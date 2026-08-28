/**
 * OrderConfirmationPage
 *
 * Post-order confirmation with order ID, item summary, delivery address,
 * estimated delivery, and navigation actions. Reads order from the persisted
 * Zustand store, so a refresh on this URL keeps the order data.
 */

import { Link, useParams } from "react-router-dom";
import { CheckCircle, MapPin, Package, ShoppingBag, AlertCircle } from "lucide-react";
import { Container, Button } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useCheckoutStore } from "@/store/checkoutStore";
import { formatCurrency } from "@/utils/formatters";
import { PAYMENT_METHOD_LABELS } from "@/config/checkout";

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  usePageTitle("Order Confirmed");

  const orders = useCheckoutStore((s) => s.orders);
  const order = orders.find((o) => o.id === orderId);

  const confirmation = order ? (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-500">Order ID</span>
          <span className="text-sm font-semibold text-surface-900">{order.id}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-surface-500">Estimated Delivery</span>
          <span className="text-sm font-semibold text-brand-600">{order.estimatedDelivery}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-surface-500">Payment</span>
          <span className="text-sm font-medium text-surface-700">
            {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-surface-200 bg-surface-0 p-5 text-left">
        <h2 className="text-sm font-semibold text-surface-900">
          Items ({order.items.length})
        </h2>
        <ul className="mt-3 divide-y divide-surface-100">
          {order.items.slice(0, 4).map((item) => (
            <li key={item.product.id} className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
              <div className="flex min-w-0 items-center gap-2">
                <Package size={14} className="shrink-0 text-surface-400" />
                <span className="truncate text-sm text-surface-700">{item.product.name}</span>
              </div>
              <span className="shrink-0 text-sm text-surface-600">
                {item.quantity} &times; {formatCurrency(item.product.price)}
              </span>
            </li>
          ))}
        </ul>
        {order.items.length > 4 && (
          <p className="mt-2 text-xs text-surface-400">
            +{order.items.length - 4} more item{order.items.length - 4 > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {order.address?.fullName && (
        <div className="mt-4 rounded-xl border border-surface-200 bg-surface-0 p-5 text-left">
          <h2 className="text-sm font-semibold text-surface-900">Delivery Address</h2>
          <div className="mt-2 flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0 text-surface-400" />
            <div className="min-w-0 text-sm text-surface-600">
              <p>{order.address.fullName}</p>
              <p>{order.address.line1}</p>
              <p>
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <p>{order.address.phone}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-surface-200 bg-surface-0 p-5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-surface-900">Total Paid</span>
          <span className="text-base font-bold text-brand-700">
            {formatCurrency(order.grandTotal)}
          </span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Orders", path: "/orders" },
            { label: "Order Confirmed" },
          ]}
        />

        <div className="flex min-h-[50vh] items-center justify-center py-12">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-50">
              {order ? (
                <CheckCircle size={40} className="text-success-600" />
              ) : (
                <AlertCircle size={40} className="text-danger-500" />
              )}
            </div>

            <h1 className="mt-6 text-2xl font-bold text-surface-900">
              {order ? "Order Placed Successfully!" : "Order Not Found"}
            </h1>

            <p className="mt-2 text-surface-500">
              {order
                ? "Thank you for your order. We'll send you a confirmation shortly."
                : "We couldn't find this order. It may have been placed in another session."}
            </p>

            {confirmation}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to={order ? "/orders" : "/categories"}>
                <Button variant="secondary" fullWidth>
                  <Package size={16} className="mr-2" />
                  {order ? "View Orders" : "Continue Shopping"}
                </Button>
              </Link>
              <Link to="/categories">
                <Button fullWidth>
                  <ShoppingBag size={16} className="mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
