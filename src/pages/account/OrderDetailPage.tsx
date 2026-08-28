import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Package,
  ArrowLeft,
  RotateCcw,
  XCircle,
  Truck,
  MapPin,
  CreditCard,
  ShoppingCart,
  AlertCircle,
  HelpCircle,
  MessageCircle,
  FileText,
  Mail,
  Phone,
  UserCircle,
  Receipt,
} from "lucide-react";
import { Container, Badge, Button, Modal, Select, Textarea } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useOrderHistory } from "@/hooks/checkout/useCheckout";
import { useCart } from "@/hooks/shopping";
import { useAddresses } from "@/hooks/checkout/useAddress";
import { useAuth } from "@/hooks/auth/useAuth";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { DELIVERY_SPEED_LABELS, PAYMENT_METHOD_LABELS } from "@/config/checkout";
import { InvoiceDownloadButton, OrderTrackingTimeline } from "@/components/order";
import { ORDER_STATUS_LABELS } from "@/utils/orderTracking";
import type { OrderStatus } from "@/types/checkout";

const STATUS_VARIANTS: Record<OrderStatus, "success" | "warning" | "info" | "danger"> = {
  placed: "info",
  confirmed: "info",
  processing: "warning",
  packed: "warning",
  shipped: "warning",
  out_for_delivery: "warning",
  delivered: "success",
  cancelled: "danger",
};

const CANCEL_REASONS = [
  { label: "Changed mind", value: "changed_mind" },
  { label: "Found better price", value: "better_price" },
  { label: "No longer needed", value: "not_needed" },
  { label: "Other", value: "other" },
];

const RETURN_REASONS = [
  { label: "Damaged product", value: "damaged" },
  { label: "Wrong item received", value: "wrong_item" },
  { label: "Quality issue", value: "quality_issue" },
  { label: "Not as described", value: "not_as_described" },
  { label: "Other", value: "other" },
];

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  usePageTitle("Order Detail");

  const { data: orders, isLoading } = useOrderHistory();
  const { addItem } = useCart();
  const { data: addresses } = useAddresses();
  const { user } = useAuth();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");

  const order = orders?.find((o) => o.id === orderId);
  const deliveryAddress = addresses?.find((a) => a.id === order?.address?.id) ?? order?.address;

  if (isLoading) {
    return (
      <div className="bg-surface-50 pb-12">
        <Container>
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-surface-500">Loading order details...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-surface-50 pb-12">
        <Container>
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Orders", path: "/orders" },
              { label: "Order Detail" },
            ]}
          />
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle size={48} className="text-surface-300" />
            <h2 className="mt-4 text-lg font-semibold text-surface-900">Order not found</h2>
            <p className="mt-1 text-sm text-surface-500">
              The order you are looking for does not exist.
            </p>
            <Link
              to="/orders"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <ArrowLeft size={16} />
              Back to Orders
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const handleReorder = () => {
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addItem(item.product);
      }
    });
  };

  const handleCancelConfirm = () => {
    setCancelModalOpen(false);
    setCancelReason("");
  };

  const handleReturnConfirm = () => {
    setReturnModalOpen(false);
    setReturnReason("");
    setReturnDescription("");
  };

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Orders", path: "/orders" },
            { label: "Order Detail" },
          ]}
        />

        <div className="mt-4">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 transition-colors hover:text-brand-600"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Package size={20} className="text-brand-600" />
            <h1 className="text-xl font-bold tracking-tight text-surface-900">
              Order {order.id}
            </h1>
            <Badge variant={STATUS_VARIANTS[order.status]}>
              {ORDER_STATUS_LABELS[order.status] ?? order.status.replace("_", " ")}
            </Badge>
            {order.payment && (
              <Badge variant={order.payment.status === "paid" ? "success" : "warning"}>
                Payment {order.payment.status}
              </Badge>
            )}
          </div>
          <p className="text-sm text-surface-500">
            Placed on{" "}
            {new Date(order.placedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Order Items */}
            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
              <h2 className="mb-4 text-base font-semibold text-surface-900">Order Summary</h2>
              <div className="divide-y divide-surface-100">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100">
                        <Package size={18} className="text-surface-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900">{item.product.name}</p>
                        <p className="text-xs text-surface-500">
                          Qty: {item.quantity} &middot; {formatCurrency(item.product.price)} each
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-surface-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
              <h2 className="mb-3 text-base font-semibold text-surface-900">Customer Information</h2>
              {user ? (
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <UserCircle size={16} className="mt-0.5 shrink-0 text-surface-400" />
                    <div>
                      <p className="text-sm font-medium text-surface-900">{user.fullName}</p>
                      <p className="text-sm text-surface-500">Customer ID: {user.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="shrink-0 text-surface-400" />
                    <span className="text-sm text-surface-600">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="shrink-0 text-surface-400" />
                    <span className="text-sm text-surface-600">{user.phone}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-surface-500">Not available for this session.</p>
              )}
            </div>

            {/* Delivery Information */}
            {deliveryAddress && (
              <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
                <h2 className="mb-3 text-base font-semibold text-surface-900">Delivery Address</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 text-surface-400" />
                    <div>
                      <p className="text-sm font-medium text-surface-900">{deliveryAddress.fullName}</p>
                      <p className="text-sm text-surface-500">
                        {deliveryAddress.line1}
                        {deliveryAddress.line2 ? `, ${deliveryAddress.line2}` : ""}
                      </p>
                      <p className="text-sm text-surface-500">
                        {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
                      </p>
                      <p className="text-sm text-surface-500">{deliveryAddress.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck size={16} className="text-surface-400" />
                    <span className="text-sm text-surface-600">
                      {DELIVERY_SPEED_LABELS[order.deliverySpeed] ?? order.deliverySpeed}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck size={16} className="text-surface-400" />
                    <span className="text-sm text-surface-600">
                      Tracking: {order.trackingId || "Yet to be generated"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
              <h2 className="mb-3 text-base font-semibold text-surface-900">Payment Information</h2>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="shrink-0 text-surface-400" />
                  <span className="text-sm text-surface-600">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                  </span>
                </div>
                {order.payment?.instrumentSummary && (
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="shrink-0 text-surface-400" />
                    <span className="text-sm text-surface-600">{order.payment.instrumentSummary}</span>
                  </div>
                )}
                {order.payment?.transactionId && (
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="shrink-0 text-surface-400" />
                    <span className="text-sm text-surface-600">
                      Transaction ID: {order.payment.transactionId}
                    </span>
                  </div>
                )}
                {order.payment?.paidAt && (
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="shrink-0 text-surface-400" />
                    <span className="text-sm text-surface-600">
                      Paid on {formatDate(order.payment.paidAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Invoice */}
              <div className="mt-4 border-t border-surface-100 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Receipt size={16} className="shrink-0 text-surface-400" />
                    <div>
                      <p className="text-sm font-medium text-surface-900">
                        Invoice {order.invoiceId || "(pending)"}
                      </p>
                      <p className="text-xs text-surface-400">
                        Download a printable copy (mock)
                      </p>
                    </div>
                  </div>
                  <InvoiceDownloadButton
                    orderId={order.id}
                    size="sm"
                    label="Download"
                    className="shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
              <h2 className="mb-4 text-base font-semibold text-surface-900">Price Details</h2>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Subtotal</span>
                  <span className="text-surface-900">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Savings</span>
                    <span className="text-success-600">-{formatCurrency(order.savings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Delivery</span>
                  <span className="text-surface-900">
                    {order.deliveryCharge === 0 ? "Free" : formatCurrency(order.deliveryCharge)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Discount</span>
                    <span className="text-success-600">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Tax</span>
                  <span className="text-surface-900">{formatCurrency(order.tax)}</span>
                </div>
                <div className="border-t border-surface-200 pt-2.5">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-surface-900">Grand Total</span>
                    <span className="text-base font-bold text-brand-700">
                      {formatCurrency(order.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
              <h2 className="mb-4 text-base font-semibold text-surface-900">Order Tracking</h2>
              <OrderTrackingTimeline order={order} />
            </div>

            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
              <h2 className="mb-4 text-base font-semibold text-surface-900">Actions</h2>
              <div className="space-y-3">
                <Button variant="primary" fullWidth onClick={handleReorder}>
                  <ShoppingCart size={16} className="mr-2" />
                  Reorder
                </Button>
                <InvoiceDownloadButton orderId={order.id} variant="secondary" fullWidth />
                {order.status !== "cancelled" && order.status !== "delivered" && (
                  <Button variant="danger" fullWidth onClick={() => setCancelModalOpen(true)}>
                    <XCircle size={16} className="mr-2" />
                    Cancel Order
                  </Button>
                )}
                {order.status === "delivered" && (
                  <Button variant="secondary" fullWidth onClick={() => setReturnModalOpen(true)}>
                    <RotateCcw size={16} className="mr-2" />
                    Return Request
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-surface-900">
                <HelpCircle size={18} /> Need Help?
              </h2>
              <p className="mb-4 text-sm text-surface-500">Having issues with this order? We're here to help.</p>
              <div className="space-y-2">
                <Link to="/help/faq" className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50">
                  <HelpCircle size={14} /> Browse FAQ
                </Link>
                <Link to="/help/contact" className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50">
                  <MessageCircle size={14} /> Contact Support
                </Link>
                <Link to={`/help/tickets/new?orderId=${order.id}`} className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50">
                  <FileText size={14} /> Raise a Ticket for This Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-danger-50 p-3">
            <AlertCircle size={18} className="text-danger-600" />
            <p className="text-sm text-danger-700">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
          </div>
          <Select
            label="Reason for cancellation"
            options={CANCEL_REASONS}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Select a reason"
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelConfirm}
              disabled={!cancelReason}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Return Request"
      >
        <div className="space-y-4">
          <Select
            label="Reason for return"
            options={RETURN_REASONS}
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Select a reason"
          />
          <Textarea
            label="Description"
            placeholder="Please describe the issue in detail..."
            rows={4}
            value={returnDescription}
            onChange={(e) => setReturnDescription(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReturnConfirm}
              disabled={!returnReason}
            >
              Submit Return Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}