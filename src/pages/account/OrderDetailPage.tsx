import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Package,
  ArrowLeft,
  Download,
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
} from "lucide-react";
import { Container, Badge, Button, Modal, Select, Textarea } from "@/components/ui";
import Timeline from "@/components/ui/Timeline";
import type { TimelineEvent } from "@/components/ui/Timeline";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useOrderHistory } from "@/hooks/checkout/useCheckout";
import { useCart } from "@/hooks/shopping";
import { useAddresses } from "@/hooks/checkout/useAddress";
import { formatCurrency } from "@/utils/formatters";
import type { OrderStatus } from "@/types/checkout";

const STATUS_VARIANTS: Record<string, "success" | "warning" | "info" | "danger"> = {
  placed: "info",
  confirmed: "info",
  processing: "warning",
  shipped: "warning",
  delivered: "success",
  cancelled: "danger",
};

const STATUS_ORDER: Record<OrderStatus, number> = {
  placed: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: 5,
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

function buildTimeline(status: OrderStatus): TimelineEvent[] {
  const now = new Date().toISOString();
  const events: TimelineEvent[] = [];

  events.push({
    type: "placed",
    label: "Order Placed",
    timestamp: now,
    description: "Your order has been received",
    isCompleted: status !== "cancelled" && STATUS_ORDER[status] > 0,
    isCurrent: status === "placed",
  });

  if (STATUS_ORDER[status] >= 1 && status !== "cancelled") {
    events.push({
      type: "confirmed",
      label: "Order Confirmed",
      timestamp: now,
      description: "Your order has been confirmed",
      isCompleted: STATUS_ORDER[status] > 1,
      isCurrent: status === "confirmed",
    });
  }

  if (STATUS_ORDER[status] >= 2 && status !== "cancelled") {
    events.push({
      type: "processing",
      label: "Processing",
      timestamp: now,
      description: "Your order is being prepared",
      isCompleted: STATUS_ORDER[status] > 2,
      isCurrent: status === "processing",
    });
  }

  if (STATUS_ORDER[status] >= 3 && status !== "cancelled") {
    events.push({
      type: "shipped",
      label: "Shipped",
      timestamp: now,
      description: "Your order is on the way",
      isCompleted: STATUS_ORDER[status] > 3,
      isCurrent: status === "shipped",
    });
  }

  if (status === "delivered") {
    events.push({
      type: "delivered",
      label: "Delivered",
      timestamp: now,
      description: "Your order has been delivered",
      isCompleted: true,
    });
  }

  if (status === "cancelled") {
    events.push({
      type: "cancelled",
      label: "Cancelled",
      timestamp: now,
      description: "Your order has been cancelled",
      isCompleted: true,
      isCancelled: true,
    });
  }

  return events;
}

const DELIVERY_SPEED_LABELS: Record<string, string> = {
  standard: "Standard Delivery (3-5 days)",
  express: "Express Delivery (1-2 days)",
  same_day: "Same Day Delivery",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  upi: "UPI",
  card: "Credit/Debit Card",
  net_banking: "Net Banking",
  wallet: "Wallet",
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  usePageTitle("Order Detail");

  const { data: orders, isLoading } = useOrderHistory();
  const { addItem } = useCart();
  const { data: addresses } = useAddresses();

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

  const timeline = buildTimeline(order.status);

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
          <div className="flex items-center gap-3">
            <Package size={20} className="text-brand-600" />
            <h1 className="text-xl font-bold tracking-tight text-surface-900">
              Order {order.id}
            </h1>
            <Badge variant={STATUS_VARIANTS[order.status]}>
              {order.status.replace("_", " ")}
            </Badge>
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
            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
              <h2 className="mb-4 text-base font-semibold text-surface-900">Order Items</h2>
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

            {deliveryAddress && (
              <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
                <h2 className="mb-3 text-base font-semibold text-surface-900">Delivery Information</h2>
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
                </div>
              </div>
            )}

            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
              <h2 className="mb-3 text-base font-semibold text-surface-900">Payment Method</h2>
              <div className="flex items-center gap-3">
                <CreditCard size={16} className="text-surface-400" />
                <span className="text-sm text-surface-600">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
              <h2 className="mb-4 text-base font-semibold text-surface-900">Order Summary</h2>
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
              <h2 className="mb-4 text-base font-semibold text-surface-900">Order Timeline</h2>
              <Timeline events={timeline} />
            </div>

            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
              <h2 className="mb-4 text-base font-semibold text-surface-900">Actions</h2>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleReorder}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Reorder
                </Button>
                {order.status !== "cancelled" && order.status !== "delivered" && (
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => setCancelModalOpen(true)}
                  >
                    <XCircle size={16} className="mr-2" />
                    Cancel Order
                  </Button>
                )}
                {order.status === "delivered" && (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setReturnModalOpen(true)}
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Return Request
                  </Button>
                )}
                <Button
                  variant="secondary"
                  fullWidth
                  disabled
                >
                  <Download size={16} className="mr-2" />
                  Download Invoice
                </Button>
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
