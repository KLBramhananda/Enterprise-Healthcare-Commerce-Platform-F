/**
 * OffersSection
 *
 * Demo coupon catalog shown in the Coupon checkout step. Offers are applied,
 * removed, or changed through the same mock promo pipeline used by the manual
 * PromoCodeInput (useValidatePromo → checkout service), so totals update
 * reactively via the checkout store/hook with no duplicated logic.
 */

import { useState } from "react";
import { Check, Sparkles, Tag, X } from "lucide-react";
import { Button } from "@/components/ui";
import { CHECKOUT_OFFERS, type CheckoutOffer } from "@/config/checkout";
import { useValidatePromo } from "@/hooks/checkout/useCheckout";
import { useCheckoutStore } from "@/store/checkoutStore";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/utils/cn";

function OfferCard({
  offer,
  subtotal,
  active,
  isApplying,
  onApply,
  onRemove,
}: {
  offer: CheckoutOffer;
  subtotal: number;
  active: boolean;
  isApplying: boolean;
  onApply: () => void;
  onRemove: () => void;
}) {
  const locked = offer.minOrder !== undefined && subtotal < offer.minOrder;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border p-3.5 transition-colors",
        active
          ? "border-success-300 bg-success-50/70"
          : "border-surface-200 bg-surface-0",
        !active && !locked && "hover:border-brand-300",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            active ? "bg-success-100 text-success-700" : "bg-brand-50 text-brand-600",
          )}
        >
          <Tag size={15} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-bold text-surface-900">{offer.code}</p>
            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
              {offer.badge}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-surface-600">{offer.title}</p>
          <p className="text-xs text-surface-400">
            {offer.detail}
            {locked && offer.minOrder !== undefined && (
              <span className="text-surface-500">
                {" "}
                · Requires {formatCurrency(offer.minOrder)}+ subtotal
              </span>
            )}
          </p>
        </div>
      </div>

      {active ? (
        <Button size="sm" variant="ghost" onClick={onRemove} className="shrink-0">
          <X size={14} className="mr-1" />
          Remove
        </Button>
      ) : locked ? (
        <span className="mt-1.5 flex shrink-0 items-center gap-1 text-xs text-surface-400">
          <Tag size={12} />
          Policy
        </span>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          onClick={onApply}
          loading={isApplying}
          className="shrink-0"
        >
          Apply
        </Button>
      )}
    </div>
  );
}

export default function OffersSection({ subtotal }: { subtotal: number }) {
  const { validate } = useValidatePromo();
  const appliedPromo = useCheckoutStore((s) => s.session.appliedPromo);
  const removePromo = useCheckoutStore((s) => s.setAppliedPromo);
  const [applying, setApplying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async (code: string) => {
    setError(null);
    setApplying(code);
    const result = await validate(code);
    setApplying(null);
    if (!result) {
      setError(`${code} is not available for the current cart. Try another offer.`);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-1.5">
        <Sparkles size={14} className="text-brand-600" />
        <h3 className="text-sm font-semibold text-surface-900">Available Offers</h3>
      </div>
      <p className="mt-0.5 text-xs text-surface-500">
        Apply one offer per order. Only one coupon can be active at a time.
      </p>

      <div className="mt-3 space-y-2">
        {CHECKOUT_OFFERS.map((offer) => (
          <OfferCard
            key={offer.code}
            offer={offer}
            subtotal={subtotal}
            active={appliedPromo?.code === offer.code}
            isApplying={applying === offer.code}
            onApply={() => handleApply(offer.code)}
            onRemove={() => removePromo(null)}
          />
        ))}
      </div>

      {appliedPromo && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-700">
          <Check size={13} />
          {appliedPromo.code} applied — {formatCurrency(appliedPromo.discountAmount)} saved
          {appliedPromo.discountType === "free_delivery" && " (delivery is free)"}
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-danger-600">{error}</p>
      )}
    </div>
  );
}