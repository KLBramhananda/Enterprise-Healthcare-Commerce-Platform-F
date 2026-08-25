/**
 * OrderReview
 *
 * Final checkout section with a summary of all selections
 * and the "Place Order" button. Validates all required fields
 * before enabling the action.
 */

import { ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui";
import { formatCurrency } from "@/utils/formatters";
import type { Address, DeliverySpeed, PaymentMethodType } from "@/types/checkout";

interface OrderReviewProps {
  address: Address | null;
  deliverySpeed: DeliverySpeed;
  paymentMethod: PaymentMethodType | null;
  prescriptionCount: number;
  hasPrescriptionItems: boolean;
  grandTotal: number;
  canPlaceOrder: boolean;
  isPlacing: boolean;
  onPlaceOrder: () => void;
}

const DELIVERY_LABELS: Record<DeliverySpeed, string> = {
  standard: "Standard Delivery (3-5 days)",
  express: "Express Delivery (1-2 days)",
  same_day: "Same Day Delivery",
};

const PAYMENT_LABELS: Record<PaymentMethodType, string> = {
  cod: "Cash on Delivery",
  upi: "UPI",
  card: "Credit / Debit Card",
  net_banking: "Net Banking",
  wallet: "Wallet",
};

export default function OrderReview({
  address,
  deliverySpeed,
  paymentMethod,
  prescriptionCount,
  hasPrescriptionItems,
  grandTotal,
  canPlaceOrder,
  isPlacing,
  onPlaceOrder,
}: OrderReviewProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-surface-900">Review Order</h2>

      <div className="mt-3 space-y-3">
        {/* Address summary */}
        <div className="rounded-lg bg-surface-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-surface-400">Delivery Address</p>
          {address ? (
            <p className="mt-1 text-sm text-surface-700">
              {address.fullName}, {address.line1}, {address.city}, {address.state} {address.pincode}
            </p>
          ) : (
            <p className="mt-1 text-sm text-danger-600">No address selected</p>
          )}
        </div>

        {/* Delivery summary */}
        <div className="rounded-lg bg-surface-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-surface-400">Delivery</p>
          <p className="mt-1 text-sm text-surface-700">{DELIVERY_LABELS[deliverySpeed]}</p>
        </div>

        {/* Prescription summary */}
        {hasPrescriptionItems && (
          <div className="rounded-lg bg-surface-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-surface-400">Prescription</p>
            <p className="mt-1 text-sm text-surface-700">
              {prescriptionCount} file{prescriptionCount !== 1 ? "s" : ""} uploaded
            </p>
          </div>
        )}

        {/* Payment summary */}
        <div className="rounded-lg bg-surface-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-surface-400">Payment</p>
          {paymentMethod ? (
            <p className="mt-1 text-sm text-surface-700">{PAYMENT_LABELS[paymentMethod]}</p>
          ) : (
            <p className="mt-1 text-sm text-danger-600">No payment method selected</p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <Button
          fullWidth
          size="lg"
          disabled={!canPlaceOrder || isPlacing}
          onClick={onPlaceOrder}
        >
          {isPlacing ? (
            "Placing Order..."
          ) : (
            <>
              <Lock size={14} className="mr-2" />
              Place Order &mdash; {formatCurrency(grandTotal)}
            </>
          )}
        </Button>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-surface-400">
          <ShieldCheck size={12} />
          <span>Secure checkout. Your data is encrypted.</span>
        </div>
      </div>
    </div>
  );
}
