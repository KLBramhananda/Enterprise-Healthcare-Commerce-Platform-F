/**
 * OrderSummaryCard
 *
 * Sticky order summary sidebar showing item list, price breakdown,
 * and promo discount. Responsive: sidebar on desktop, bottom bar on mobile.
 */

import { Lock, ShieldCheck, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import type { CartItem } from "@/store/cartStore";
import type { AppliedPromo } from "@/types/checkout";

interface OrderSummaryCardProps {
  items: CartItem[];
  subtotal: number;
  savings: number;
  deliveryCharge: number;
  discount: number;
  tax: number;
  grandTotal: number;
  appliedPromo: AppliedPromo | null;
}

export default function OrderSummaryCard({
  items,
  subtotal,
  savings,
  deliveryCharge,
  discount,
  tax,
  grandTotal,
  appliedPromo,
}: OrderSummaryCardProps) {
  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-4">
      <div className="flex items-center gap-2">
        <ShoppingBag size={16} className="text-brand-600" />
        <h3 className="text-sm font-semibold text-surface-900">
          Order Summary ({items.length} item{items.length !== 1 ? "s" : ""})
        </h3>
      </div>

      <ul className="mt-2.5 space-y-2">
        {items.map((item) => (
          <li key={item.product.id} className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-surface-700">{item.product.name}</p>
              <p className="text-xs text-surface-400">Qty: {item.quantity}</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-surface-900">
              {formatCurrency(item.product.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 space-y-1.5 border-t border-surface-100 pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-surface-500">Subtotal</span>
          <span className="font-medium text-surface-900">{formatCurrency(subtotal)}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Savings</span>
            <span className="font-medium text-success-600">-{formatCurrency(savings)}</span>
          </div>
        )}
        {discount > 0 && appliedPromo && (
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Promo ({appliedPromo.code})</span>
            <span className="font-medium text-success-600">-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-surface-500">Delivery</span>
          <span className="font-medium text-surface-900">
            {deliveryCharge === 0 ? (
              <span className="text-success-600">Free</span>
            ) : (
              formatCurrency(deliveryCharge)
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-surface-500">Tax (8%)</span>
          <span className="font-medium text-surface-900">{formatCurrency(tax)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-50/70 px-3 py-2.5">
        <span className="text-sm font-semibold text-surface-900">Grand Total</span>
        <span className="text-lg font-bold text-brand-700">{formatCurrency(grandTotal)}</span>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-surface-400">
        <ShieldCheck size={12} className="text-success-600" />
        <span>100% secure checkout</span>
        <span className="text-surface-300">·</span>
        <Lock size={11} className="text-surface-500" />
        <span>256-bit encrypted</span>
      </div>
    </div>
  );
}
