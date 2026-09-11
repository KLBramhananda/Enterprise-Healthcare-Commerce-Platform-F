/**
 * DeliveryOptions
 *
 * Delivery speed selection with estimated dates, pricing,
 * and optional delivery instructions textarea.
 */

import { Truck, Zap, Clock } from "lucide-react";
import { Textarea } from "@/components/ui";
import { useDeliveryOptions } from "@/hooks/checkout/useCheckout";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import type { DeliveryOption, DeliverySpeed } from "@/types/checkout";

interface DeliveryOptionsProps {
  selectedSpeed: DeliverySpeed;
  deliveryNote: string;
  onSelectSpeed: (speed: DeliverySpeed) => void;
  onSetDeliveryNote: (note: string) => void;
}

const SPEED_ICONS: Record<DeliverySpeed, typeof Truck> = {
  standard: Truck,
  express: Zap,
  same_day: Clock,
};

// Every option carries its configured charge from the delivery-options data
// (never a magic number in this component). The charge shown on the selected
// option is the exact figure applied to the order totals — the checkout
// summary uses the ERP shipping charge when available and falls back to the
// selected option's configured charge otherwise, so the option list and the
// order summary always agree.
function optionChargeLabel(charge: number): string {
  return charge === 0 ? formatCurrency(0, { maximumFractionDigits: 0 }) : formatCurrency(charge);
}

// ETA is derived from the option's estimated days so it stays current instead
// of showing the static demo date strings from the config.
function estimatedLabel(option: DeliveryOption): string {
  if (!option.estimatedDays || option.estimatedDays <= 0) return "Today";
  const now = new Date();
  const to = new Date(now);
  to.setDate(to.getDate() + option.estimatedDays);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(now)} - ${fmt(to)}`;
}

export default function DeliveryOptions({
  selectedSpeed,
  deliveryNote,
  onSelectSpeed,
  onSetDeliveryNote,
}: DeliveryOptionsProps) {
  const { options, isLoading } = useDeliveryOptions();

  return (
    <div>
      <h2 className="text-base font-semibold text-surface-900">Delivery Options</h2>

      {isLoading ? (
        <div className="mt-3 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-100" />
          ))}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {options.map((option) => {
            const Icon = SPEED_ICONS[option.speed];
            return (
              <label
                key={option.speed}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-fast ease-smooth",
                  selectedSpeed === option.speed
                    ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500"
                    : "border-surface-200 hover:border-surface-300",
                )}
              >
                <input
                  type="radio"
                  name="delivery-speed"
                  checked={selectedSpeed === option.speed}
                  onChange={() => onSelectSpeed(option.speed)}
                  className="mt-1 h-4 w-4 shrink-0 border-surface-300 text-brand-600 focus:ring-brand-500/20"
                />
                <Icon size={18} className="mt-0.5 shrink-0 text-brand-600" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-surface-900">{option.label}</span>
                    <span className="text-sm font-semibold text-surface-900">
                      {option.charge === 0 ? (
                        <span className="text-success-600">{optionChargeLabel(option.charge)}</span>
                      ) : (
                        optionChargeLabel(option.charge)
                      )}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-surface-500">{option.description}</p>
                  <p className="mt-0.5 text-xs font-medium text-brand-600">
                    Est. {estimatedLabel(option)}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        <Textarea
          label="Delivery Instructions (Optional)"
          placeholder="e.g. Ring the bell, leave at reception, call before delivery..."
          value={deliveryNote}
          onChange={(e) => onSetDeliveryNote(e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}
