/**
 * OrderReview
 *
 * Final review step of the checkout wizard: a consolidated, editable summary
 * of the delivery address, delivery method, prescription, coupon and payment
 * choice, plus the full price breakdown. "Edit" links jump back to the
 * relevant wizard step. The Pay action lives in the wizard footer.
 */

import { Link } from "react-router-dom";
import {
  CreditCard,
  FileText,
  MapPin,
  Pencil,
  ShieldCheck,
  Tag,
  Truck,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import {
  DELIVERY_SPEED_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/config/checkout";
import { describeInstrument } from "@/utils/payment";
import type {
  Address,
  AppliedPromo,
  DeliverySpeed,
  PaymentInstrument,
  PaymentMethodType,
} from "@/types/checkout";

export type ReviewEditTarget =
  | "address"
  | "delivery"
  | "prescription"
  | "coupon"
  | "payment";

interface OrderReviewProps {
  address: Address | null;
  deliverySpeed: DeliverySpeed;
  paymentMethod: PaymentMethodType | null;
  instrument: PaymentInstrument | null;
  prescriptionCount: number;
  hasPrescriptionItems: boolean;
  prescriptionUploadLater: boolean;
  appliedPromo: AppliedPromo | null;
  subtotal: number;
  savings: number;
  deliveryCharge: number;
  discount: number;
  tax: number;
  grandTotal: number;
  onEdit?: (target: ReviewEditTarget) => void;
  agreementChecked: boolean;
  onAgreementChange: (checked: boolean) => void;
}

function EditLink({
  onEdit,
  target,
}: {
  onEdit?: (target: ReviewEditTarget) => void;
  target: ReviewEditTarget;
}) {
  if (!onEdit) return null;
  return (
    <button
      type="button"
      onClick={() => onEdit(target)}
      className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700"
    >
      <Pencil size={11} />
      Edit
    </button>
  );
}

export default function OrderReview({
  address,
  deliverySpeed,
  paymentMethod,
  instrument,
  prescriptionCount,
  hasPrescriptionItems,
  prescriptionUploadLater,
  appliedPromo,
  subtotal,
  savings,
  deliveryCharge,
  discount,
  tax,
  grandTotal,
  onEdit,
  agreementChecked,
  onAgreementChange,
}: OrderReviewProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-surface-900">Review Order</h2>
      <p className="mt-0.5 text-sm text-surface-500">
        Please confirm everything looks right before you pay.
      </p>

      <div className="mt-4 space-y-3">
        {/* Delivery Address */}
        <div className="flex items-start justify-between gap-3 rounded-xl border border-surface-200 bg-surface-0 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <MapPin size={16} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-surface-400">
                Delivery Address
              </p>
              {address ? (
                <>
                  <p className="mt-1 text-sm font-medium text-surface-900">{address.fullName}</p>
                  <p className="text-sm text-surface-600">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                    {address.state} - {address.pincode}
                  </p>
                  <p className="text-xs text-surface-400">{address.phone}</p>
                </>
              ) : (
                <p className="mt-1 text-sm text-danger-600">No address selected</p>
              )}
            </div>
          </div>
          <EditLink onEdit={onEdit} target="address" />
        </div>

        {/* Delivery method */}
        <div className="flex items-start justify-between gap-3 rounded-xl border border-surface-200 bg-surface-0 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Truck size={16} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-surface-400">Delivery</p>
              <p className="mt-1 text-sm font-medium text-surface-900">
                {DELIVERY_SPEED_LABELS[deliverySpeed]}
              </p>
              <p className="text-sm text-surface-600">
                {deliveryCharge === 0 ? "Free" : formatCurrency(deliveryCharge)}
              </p>
            </div>
          </div>
          <EditLink onEdit={onEdit} target="delivery" />
        </div>

        {/* Prescription */}
        {hasPrescriptionItems && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-surface-200 bg-surface-0 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <FileText size={16} />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-surface-400">
                  Prescription
                </p>
<p className="mt-1 text-sm font-medium text-surface-900">
                  {prescriptionCount} file{prescriptionCount !== 1 ? "s" : ""} uploaded
                </p>
                <p
                  className={
                    prescriptionCount > 0
                      ? "text-sm text-success-600"
                      : prescriptionUploadLater
                        ? "text-sm text-warning-600"
                        : "text-sm text-danger-600"
                  }
                >
                  {prescriptionCount > 0
                    ? "Verified"
                    : prescriptionUploadLater
                      ? "Will be uploaded later"
                      : "Required — please upload one"}
                </p>
              </div>
            </div>
            <EditLink onEdit={onEdit} target="prescription" />
          </div>
        )}

        {/* Coupon */}
        <div className="flex items-start justify-between gap-3 rounded-xl border border-surface-200 bg-surface-0 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Tag size={16} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-surface-400">Coupon</p>
              {appliedPromo ? (
                <>
                  <p className="mt-1 text-sm font-medium text-success-700">{appliedPromo.code}</p>
                  <p className="text-sm text-success-600">
                    {appliedPromo.discountPercent}% off ({formatCurrency(appliedPromo.discountAmount)} saved)
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-surface-600">No promo applied</p>
              )}
            </div>
          </div>
          <EditLink onEdit={onEdit} target="coupon" />
        </div>

        {/* Payment */}
        <div className="flex items-start justify-between gap-3 rounded-xl border border-surface-200 bg-surface-0 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <CreditCard size={16} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-surface-400">Payment</p>
              {paymentMethod && instrument ? (
                <>
                  <p className="mt-1 text-sm font-medium text-surface-900">
                    {PAYMENT_METHOD_LABELS[paymentMethod]}
                  </p>
                  <p className="text-sm text-surface-600">
                    {describeInstrument(paymentMethod, instrument)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-danger-600">No payment method selected</p>
              )}
            </div>
          </div>
          <EditLink onEdit={onEdit} target="payment" />
        </div>
      </div>

      {/* Price breakdown */}
      <div className="mt-5 rounded-xl border border-surface-200 bg-surface-0 p-4">
        <h3 className="text-sm font-semibold text-surface-900">Price Details</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-surface-500">Subtotal</span>
            <span className="font-medium text-surface-900">{formatCurrency(subtotal)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between">
              <span className="text-surface-500">Savings</span>
              <span className="font-medium text-success-600">-{formatCurrency(savings)}</span>
            </div>
          )}
          {discount > 0 && appliedPromo && (
            <div className="flex justify-between">
              <span className="text-surface-500">Promo ({appliedPromo.code})</span>
              <span className="font-medium text-success-600">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-surface-500">Delivery</span>
            <span className="font-medium text-surface-900">
              {deliveryCharge === 0 ? "Free" : formatCurrency(deliveryCharge)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Tax (8%)</span>
            <span className="font-medium text-surface-900">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-surface-200 pt-2">
            <span className="text-base font-bold text-surface-900">Grand Total</span>
            <span className="text-base font-bold text-brand-700">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {savings + discount > 0 && (
          <p className="mt-3 rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-700">
            You're saving {formatCurrency(savings + discount)} on this order today.
          </p>
        )}
      </div>

<label className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-xl border border-surface-200 bg-surface-0 p-4">
        <input
          type="checkbox"
          checked={agreementChecked}
          onChange={(e) => onAgreementChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 border-surface-300 text-brand-600 focus:ring-brand-500/20"
          aria-label="I confirm the order details"
        />
        <span className="text-sm text-surface-700">
          I confirm that the shipping address, items, quantities, and total amount shown above
          are correct, and I agree to the{" "}
          <Link to="/help" className="font-medium text-brand-600 hover:text-brand-700">
            terms &amp; conditions
          </Link>{" "}
          and{" "}
          <Link to="/help/returns" className="font-medium text-brand-600 hover:text-brand-700">
            return policy
          </Link>
          .
        </span>
      </label>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-surface-400">
        <ShieldCheck size={12} className="text-success-600" />
        <span>Secure checkout. Your payment details are encrypted.</span>
      </p>
    </div>
  );
}

export type { OrderReviewProps };
