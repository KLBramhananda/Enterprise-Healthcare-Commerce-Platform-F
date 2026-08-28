/**
 * PaymentMethodSelector
 *
 * Payment method selection with radio cards for COD, UPI,
 * Cards, Net Banking, and Wallet.
 */

import { Banknote, Smartphone, CreditCard, Building2, Wallet } from "lucide-react";
import { cn } from "@/utils/cn";
import type { PaymentMethodType } from "@/types/checkout";

interface PaymentMethodSelectorProps {
  selected: PaymentMethodType | null;
  onSelect: (method: PaymentMethodType) => void;
}

const PAYMENT_METHODS: Array<{
  type: PaymentMethodType;
  label: string;
  description: string;
  icon: typeof Banknote;
}> = [
  { type: "cod", label: "Cash on Delivery", description: "Pay when your order arrives", icon: Banknote },
  { type: "upi", label: "UPI", description: "PhonePe, Google Pay, Paytm, etc.", icon: Smartphone },
  { type: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, RuPay", icon: CreditCard },
  { type: "net_banking", label: "Net Banking", description: "All major banks supported", icon: Building2 },
  { type: "wallet", label: "Wallet", description: "Paytm, Amazon Pay, etc.", icon: Wallet },
];

export default function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-surface-900">Payment Method</h2>
      <p className="mt-0.5 text-sm text-surface-500">Select how you'd like to pay</p>

      <div className="mt-3 space-y-2">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = selected === method.type;
          return (
            <label
              key={method.type}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-fast ease-smooth",
                isSelected
                  ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500"
                  : "border-surface-200 hover:border-surface-300",
              )}
            >
              <input
                type="radio"
                name="payment-method"
                checked={isSelected}
                onChange={() => onSelect(method.type)}
                className="h-4 w-4 shrink-0 border-surface-300 text-brand-600 focus:ring-brand-500/20"
              />
              <Icon size={18} className={cn("shrink-0", isSelected ? "text-brand-600" : "text-surface-400")} />
              <div>
                <span className="text-sm font-medium text-surface-900">{method.label}</span>
                <p className="text-xs text-surface-500">{method.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
