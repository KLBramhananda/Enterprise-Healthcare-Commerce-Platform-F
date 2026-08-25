/**
 * PromoCodeInput
 *
 * Promo code input with validation, applied state, and remove option.
 */

import { useState } from "react";
import { Tag, X, AlertCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useValidatePromo } from "@/hooks/checkout/useCheckout";
import { useCheckoutStore } from "@/store/checkoutStore";
import { formatCurrency } from "@/utils/formatters";

export default function PromoCodeInput() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { validate } = useValidatePromo();
  const appliedPromo = useCheckoutStore((s) => s.session.appliedPromo);
  const removePromo = useCheckoutStore((s) => s.setAppliedPromo);

  const handleApply = async () => {
    if (!code.trim()) return;
    setError(null);
    setIsValidating(true);
    const result = await validate(code.trim());
    setIsValidating(false);
    if (result) {
      setCode("");
    } else {
      setError("Invalid promo code or minimum order not met");
    }
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-success-200 bg-success-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-success-600" />
          <span className="text-sm font-semibold text-success-800">
            {appliedPromo.code}
          </span>
          <span className="text-sm text-success-700">
            — {appliedPromo.discountPercent}% off ({formatCurrency(appliedPromo.discountAmount)} saved)
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            removePromo(null);
            setError(null);
          }}
          className="rounded p-1 text-success-600 hover:bg-success-100"
          aria-label="Remove promo code"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
            error={error ?? undefined}
          />
        </div>
        <Button
          variant="secondary"
          onClick={handleApply}
          disabled={!code.trim() || isValidating}
        >
          {isValidating ? "Checking..." : "Apply"}
        </Button>
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-danger-600">
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
}
