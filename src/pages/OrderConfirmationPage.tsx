/**
 * OrderConfirmationPage
 *
 * Post-order confirmation with order ID, estimated delivery,
 * and navigation actions. Reads order from persisted Zustand store.
 */

import { Link, useParams } from "react-router-dom";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";
import { Container, Button } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useCheckoutStore } from "@/store/checkoutStore";

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  usePageTitle("Order Confirmed");

  const orders = useCheckoutStore((s) => s.orders);
  const order = orders.find((o) => o.id === orderId);

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
              <CheckCircle size={40} className="text-success-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-surface-900">
              Order Placed Successfully!
            </h1>

            <p className="mt-2 text-surface-500">
              Thank you for your order. We'll send you a confirmation shortly.
            </p>

            {order && (
              <div className="mt-6 rounded-xl border border-surface-200 bg-surface-0 p-5 text-left">
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
                  <span className="text-sm font-medium text-surface-700 capitalize">
                    {order.paymentMethod.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-3 border-t border-surface-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-surface-900">Total Paid</span>
                    <span className="text-base font-bold text-brand-700">
                      ${order.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/orders">
                <Button variant="secondary" fullWidth>
                  <Package size={16} className="mr-2" />
                  View Orders
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
