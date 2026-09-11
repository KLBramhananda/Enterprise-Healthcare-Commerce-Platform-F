/**
 * OrderConfirmationPage
 *
 * Success screen shown after a completed purchase: animated confirmation,
 * order reference, delivery estimate, payment details, ordered items,
 * savings summary, and post-purchase actions (view order / download invoice).
 * Reads the order ERP-first (authoritative server state) with the persisted
 * Zustand store as the offline fallback, so a refresh keeps the data.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  CalendarClock,
  Check,
  CreditCard,
  FileText,
  Headphones,
  MapPin,
  Package,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Container, Button } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useOrderDetail } from "@/hooks/orders/useOrders";
import { useCheckoutStore } from "@/store/checkoutStore";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { PAYMENT_METHOD_LABELS } from "@/config/checkout";
import { InvoiceDownloadButton } from "@/components/order";
import { ORDER_STATUS_LABELS } from "@/utils/orderTracking";

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  usePageTitle("Order Confirmed");

  const orders = useCheckoutStore((s) => s.orders);
  const storeOrder = orders.find((o) => o.id === orderId) ?? null;
  const erpQuery = useOrderDetail(orderId);

  // The persisted checkout-store order carries the totals, delivery speed,
  // applied offer and platform fee the shopper actually saw and paid at
  // checkout (Grand Total = Item Price + Delivery Charge - Offer Discount +
  // GST/Tax + Platform Fee, with GST/Tax = 0). The ERP record is authoritative
  // for lifecycle fields — payment status, tracking id, invoice id — so those
  // win, but the ERP's own backend-priced figures never override the checkout
  // amounts (and the ERP order has no applied-offer field, so the offer is
  // remembered from the store record of the SAME order — never invented).
  const order = useMemo(() => {
    const erp = erpQuery.data ?? null;
    if (erp && storeOrder) {
      return {
        ...storeOrder,
        ...erp,
        // ERP lifecycle fields win so the badge and the pending-redirect
        // decision follow the confirmed backend state instead of a possibly
        // stale store snapshot.
        status: erp.status,
        trackingId: erp.trackingId || storeOrder.trackingId,
        invoiceId: erp.invoiceId || storeOrder.invoiceId,
        payment: { ...storeOrder.payment, ...erp.payment },
        // The store record is authoritative for the checkout amounts and the
        // user's own selections (delivery option, applied offer).
        subtotal: storeOrder.subtotal,
        savings: storeOrder.savings,
        deliveryCharge: storeOrder.deliveryCharge,
        discount: storeOrder.discount,
        tax: storeOrder.tax,
        platformFee: storeOrder.platformFee,
        grandTotal: storeOrder.grandTotal,
        deliverySpeed: storeOrder.deliverySpeed,
        appliedPromo: storeOrder.appliedPromo ?? erp.appliedPromo ?? null,
      };
    }
    if (erp) {
      return {
        ...erp,
        appliedPromo: erp.appliedPromo ?? storeOrder?.appliedPromo ?? null,
      };
    }
    return storeOrder;
  }, [erpQuery.data, storeOrder]);

  // The confirmation page is ONLY shown after a successful online payment or a
  // confirmed COD order. A pending online payment redirects back to the
  // payment page to resume the same (idempotent) gateway intent instead of
  // revealing a fake success state. The redirect is held while the ERP detail
  // is loading so a brief stale store snapshot can't bounce a paid order.
  if (
    order &&
    order.payment?.status === "pending" &&
    order.paymentMethod !== "cod" &&
    !erpQuery.isLoading
  ) {
    return <Navigate to={`/checkout/payment/${order.id}`} replace />;
  }

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Orders", path: "/orders" },
            { label: "Order Confirmation" },
          ]}
        />

        {!order ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center py-12 text-center">
            {erpQuery.isLoading ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-100"
                >
                  <Package size={36} className="animate-pulse text-surface-400" />
                </motion.div>
                <h1 className="mt-6 text-2xl font-bold text-surface-900">
                  Verifying your order&hellip;
                </h1>
                <p className="mt-2 text-surface-500">
                  Fetching the latest status from the server.
                </p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-100"
                >
                  <Package size={36} className="text-surface-400" />
                </motion.div>
                <h1 className="mt-6 text-2xl font-bold text-surface-900">Order Not Found</h1>
                <p className="mt-2 text-surface-500">
                  We couldn't find this order. It may have been placed in another session.
                </p>
                <Link to="/categories" className="mt-8">
                  <Button>
                    <ShoppingBag size={16} className="mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            {/* ── Success Hero ── */}
            <div className="mt-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-50"
              >
                <Check size={40} className="text-success-600" />
              </motion.div>

              <h1 className="mt-6 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
                {order.payment?.status === "pending" ? "Order Placed!" : "Payment Successful!"}
              </h1>
              <p className="mx-auto mt-2 max-w-md text-surface-500">
                {order.payment?.status === "pending"
                  ? "Thank you for your order. Pay by cash when your order arrives."
                  : "Thank you for your purchase. A confirmation has been sent to your account."}
              </p>

              <div className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-surface-200 bg-surface-0 px-4 py-2 text-sm text-surface-600">
                <span>Order ID</span>
                <span className="font-semibold text-surface-900">{order.id}</span>
                <span className="text-surface-300">·</span>
                <span className="capitalize">{ORDER_STATUS_LABELS[order.status]}</span>
                {order.payment && (
                  <>
                    <span className="text-surface-300">·</span>
                    <span className="font-medium text-surface-900">Payment {order.payment.status}</span>
                  </>
                )}
              </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
              {/* Items */}
              <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 md:col-span-2">
                <h2 className="text-sm font-semibold text-surface-900">
                  Items ({order.items.length})
                </h2>
                <ul className="mt-3 divide-y divide-surface-100">
                  {order.items.map((item) => (
                    <li key={item.product.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-100">
                          <Package size={16} className="text-surface-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-surface-900">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-surface-500">
                            Qty: {item.quantity} &middot; {formatCurrency(item.product.price)} each
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-surface-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Meta details */}
                <div className="mt-4 grid gap-3 border-t border-surface-100 pt-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5">
                    <CalendarClock size={16} className="mt-0.5 shrink-0 text-brand-600" />
                    <div>
                      <p className="text-xs text-surface-400">Order date</p>
                      <p className="text-sm font-medium text-surface-900">
                        {formatDate(order.placedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <BadgeCheck size={16} className="mt-0.5 shrink-0 text-brand-600" />
                    <div>
                      <p className="text-xs text-surface-400">Delivery ETA</p>
                      <p className="text-sm font-medium text-surface-900">
                        {order.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CreditCard size={16} className="mt-0.5 shrink-0 text-brand-600" />
                    <div>
                      <p className="text-xs text-surface-400">Payment method</p>
                      <p className="text-sm font-medium text-surface-900">
                        {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                        {order.payment?.instrumentSummary
                          ? ` · ${order.payment.instrumentSummary}`
                          : ""}
                      </p>
                      {order.payment?.transactionId && (
                        <p className="text-xs text-surface-400">
                          Txn: {order.payment.transactionId}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <PackageSearch size={16} className="mt-0.5 shrink-0 text-brand-600" />
                    <div>
                      <p className="text-xs text-surface-400">Tracking number</p>
                      <p className="text-sm font-medium text-surface-900">
                        {order.trackingId || "Yet to be generated"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 sm:col-span-2">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-surface-400">Shipping address</p>
                      <p className="text-sm font-medium text-surface-900">
                        {order.address?.fullName ?? "—"}
                      </p>
                      {order.address?.line1 && (
                        <p className="text-sm text-surface-600">
                          {order.address.line1}
                          {order.address.line2 ? `, ${order.address.line2}` : ""},{" "}
                          {order.address.city}, {order.address.state} - {order.address.pincode}
                        </p>
                      )}
                      <p className="text-xs text-surface-400">{order.address?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings + actions */}
              <div className="space-y-6">
                <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
                  <h2 className="text-sm font-semibold text-surface-900">Payment Summary</h2>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-surface-500">Subtotal</span>
                      <span className="font-medium text-surface-900">{formatCurrency(order.subtotal)}</span>
                    </div>
                    {order.savings > 0 && (
                      <div className="flex justify-between">
                        <span className="text-surface-500">Savings</span>
                        <span className="text-success-600">-{formatCurrency(order.savings)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-surface-500">Delivery</span>
                      <span className="font-medium text-surface-900">
                        {order.deliveryCharge === 0 ? "Free" : formatCurrency(order.deliveryCharge)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-surface-500">
                          {order.appliedPromo
                            ? `Offer (${order.appliedPromo.code})`
                            : "Discount"}
                        </span>
                        <span className="text-success-600">-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-surface-500">Tax</span>
                      <span className="font-medium text-surface-900">{formatCurrency(order.tax)}</span>
                    </div>
                    {order.platformFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-surface-500">Platform Fee</span>
                        <span className="font-medium text-surface-900">
                          {formatCurrency(order.platformFee)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-surface-200 pt-2">
                      <span className="text-base font-bold text-surface-900">Grand Total</span>
                      <span className="text-base font-bold text-brand-700">
                        {formatCurrency(order.grandTotal)}
                      </span>
                    </div>
                  </div>

                  {order.savings + order.discount > 0 && (
                    <p className="mt-3 rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-700">
                      You saved {formatCurrency(order.savings + order.discount)} on this order!
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-surface-400">
                    <ShieldCheck size={12} className="text-success-600" />
                    100% secure payment
                  </div>
                </div>

                <div className="space-y-3">
                  <InvoiceDownloadButton orderId={order.id} fullWidth />
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="secondary" fullWidth>
                      <Package size={16} className="mr-2" />
                      View Order
                    </Button>
                  </Link>
                  <Link to="/categories">
                    <Button fullWidth>
                      <ShoppingBag size={16} className="mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>

                  <Link
                    to="/help/contact"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-surface-200 px-3 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50"
                  >
                    <Headphones size={16} className="text-surface-400" />
                    Need Help?
                  </Link>

                  <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-surface-400">
                    <FileText size={12} />
                    Invoice {order.invoiceId}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}