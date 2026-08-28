/**
 * PaymentMethodPage
 *
 * Full payment method selection for the checkout wizard, backed by a mock
 * gateway. Supports UPI, Credit/Debit Cards, Net Banking, Wallets, EMI, and
 * Cash on Delivery with inline forms and client-side validation.
 *
 * The chosen method AND its instrument are pushed upward immediately via
 * `onSelect`, so the wizard can gate the "Continue" action on validity.
 *
 * Layout mirrors modern enterprise checkouts (Stripe / Amazon / Flipkart):
 * compact radio cards that act as a progressive-disclosure accordion — all
 * methods stay collapsed by default and only the selected one expands.
 */

import {
  Banknote,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  CreditCard,
  Info,
  ShieldCheck,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Input, Select } from "@/components/ui";
import { cn } from "@/utils/cn";
import {
  EMI_BANKS,
  EMI_TENURES,
  EMI_INTEREST_RATE,
  NETBANKING_BANKS,
  PAYMENT_METHOD_GROUPS,
  PAYMENT_METHOD_LABELS,
  UPI_APPS,
  WALLETS,
} from "@/config/checkout";
import {
  calculateMonthlyEmi,
  detectCardNetwork,
  formatCardNumber,
  formatExpiry,
  getNetworkLabel,
  isValidCardNumber,
  isValidExpiry,
  isValidVpa,
} from "@/utils/payment";
import { formatCurrency } from "@/utils/formatters";
import type {
  PaymentInstrument,
  PaymentMethodType,
} from "@/types/checkout";
import SandboxPaymentInfo from "./SandboxPaymentInfo";

interface PaymentMethodPageProps {
  selectedMethod: PaymentMethodType | null;
  instrument: PaymentInstrument | null;
  grandTotal: number;
  onSelect: (method: PaymentMethodType, instrument: PaymentInstrument) => void;
}

const METHOD_ICONS: Record<PaymentMethodType, LucideIcon> = {
  cod: Banknote,
  upi: Smartphone,
  card: CreditCard,
  net_banking: Building2,
  wallet: Wallet,
  emi: CalendarClock,
};

const METHOD_DESCRIPTIONS: Record<PaymentMethodType, string> = {
  cod: "Pay when your order arrives",
  upi: "Google Pay, PhonePe, Paytm, BHIM",
  card: "Visa, Mastercard, RuPay, Amex",
  net_banking: "All major banks supported",
  wallet: "Paytm, Amazon Pay, etc.",
  emi: "Monthly installments on your card",
};

function defaultInstrument(method: PaymentMethodType): PaymentInstrument {
  switch (method) {
    case "cod":
      return { kind: "cod" };
    case "upi":
      return { kind: "upi", vpa: "", app: "" };
    case "card":
      return {
        kind: "card",
        network: "visa",
        isCredit: true,
        cardholderName: "",
        number: "",
        expiry: "",
        cvv: "",
      };
    case "net_banking":
      return { kind: "net_banking", bank: "" };
    case "wallet":
      return { kind: "wallet", wallet: "" };
    case "emi":
      return { kind: "emi", bank: "", tenureMonths: 0, cardholderName: "" };
    default:
      return { kind: "cod" };
  }
}

/** Keep existing instrument if it matches the newly selected method. */
function instrumentForMethod(
  method: PaymentMethodType,
  current: PaymentInstrument | null,
): PaymentInstrument {
  if (method === "cod") return { kind: "cod" };
  if (current && current.kind === method) return current;
  return defaultInstrument(method);
}

/** Compact selectable chip used for UPI apps, wallets, banks and tenures. */
function chipClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
    active
      ? "border-brand-500 bg-brand-50 text-brand-700"
      : "border-surface-200 bg-surface-0 text-surface-700 hover:border-surface-300 hover:bg-surface-50",
  );
}

export default function PaymentMethodPage({
  selectedMethod,
  instrument,
  grandTotal,
  onSelect,
}: PaymentMethodPageProps) {
  const selectMethod = (method: PaymentMethodType) => {
    onSelect(method, instrumentForMethod(method, instrument));
  };

  const updateInstrument = (next: PaymentInstrument, method: PaymentMethodType = selectedMethod ?? "cod") => {
    onSelect(method, next);
  };

  const isCard = selectedMethod === "card" && instrument?.kind === "card";
  const isUpi = selectedMethod === "upi" && instrument?.kind === "upi";
  const isEmi = selectedMethod === "emi" && instrument?.kind === "emi";
  const isWallet = selectedMethod === "wallet" && instrument?.kind === "wallet";
  const isNetBanking = selectedMethod === "net_banking" && instrument?.kind === "net_banking";

  const monthlyEmi =
    isEmi && instrument.tenureMonths > 0
      ? calculateMonthlyEmi(grandTotal, instrument.tenureMonths, EMI_INTEREST_RATE)
      : null;

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-surface-900">Payment Method</h2>
          <p className="mt-0.5 text-xs text-surface-500">
            Choose how you'd like to pay for this order.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[11px] text-surface-400">
          <ShieldCheck size={13} className="text-success-600" />
          Secure
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        {PAYMENT_METHOD_GROUPS.map((group) => {
          const expanded = !!selectedMethod && group.methods.includes(selectedMethod);
          const panelId = `payment-panel-${group.id}`;
          return (
            <div key={group.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                  {group.title}
                </h3>
                {group.subtitle && (
                  <p className="truncate text-[11px] text-surface-400">{group.subtitle}</p>
                )}
              </div>

              {/* Compact selectable method cards (~64px) */}
              <div className="space-y-1.5">
                {group.methods.map((method) => {
                  const Icon = METHOD_ICONS[method];
                  const isSelected = selectedMethod === method;
                  return (
                    <label
                      key={method}
                      aria-expanded={isSelected}
                      aria-controls={isSelected ? panelId : undefined}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border bg-surface-0 px-3 py-2.5 transition-all duration-fast ease-smooth",
                        isSelected
                          ? "border-brand-500 ring-1 ring-brand-500/60"
                          : "border-surface-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-surface-300",
                      )}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        checked={isSelected}
                        onChange={() => selectMethod(method)}
                        className="h-4 w-4 shrink-0 border-surface-300 text-brand-600 focus:ring-brand-500/20"
                      />
                      <Icon
                        size={17}
                        className={cn(
                          "shrink-0",
                          isSelected ? "text-brand-600" : "text-surface-400",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-surface-900">
                          {PAYMENT_METHOD_LABELS[method]}
                        </span>
                        <span className="block truncate text-xs text-surface-500">
                          {METHOD_DESCRIPTIONS[method]}
                        </span>
                      </span>
                      {isSelected && <Check size={15} className="shrink-0 text-brand-600" />}
                      <ChevronDown
                        size={15}
                        className={cn(
                          "shrink-0 text-surface-400 transition-transform duration-fast ease-smooth",
                          isSelected && "rotate-180 text-brand-600",
                        )}
                      />
                    </label>
                  );
                })}
              </div>

              {/* Progressive disclosure: only the active group expands */}
              <div
                id={panelId}
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
                aria-hidden={expanded ? undefined : true}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="mt-1.5 rounded-lg border border-surface-200/80 bg-surface-50/60 p-3">
                    {/* ── Cash on Delivery ── */}
                    {selectedMethod === "cod" && (
                      <div className="flex items-start gap-2.5">
                        <Banknote size={16} className="mt-0.5 shrink-0 text-surface-400" />
                        <div className="text-sm text-surface-600">
                          <p className="font-medium text-surface-900">
                            Pay {formatCurrency(grandTotal)} when your order is delivered
                          </p>
                          <p className="mt-0.5 text-xs text-surface-500">
                            Our delivery partner will accept cash at your doorstep. Please keep the
                            exact amount ready.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ── UPI ── */}
                    {selectedMethod === "upi" && isUpi && (
                      <div className="space-y-3">
                        <div>
                          <p className="mb-1.5 text-xs font-semibold text-surface-700">
                            Choose UPI app
                          </p>
                          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                            {UPI_APPS.map((app) => {
                              const active = instrument.app === app.label;
                              return (
                                <button
                                  key={app.value}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() =>
                                    updateInstrument({ ...instrument, app: app.label })
                                  }
                                  className={chipClass(active)}
                                >
                                  {active && <Check size={12} />}
                                  {app.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <Input
                          label="UPI ID"
                          type="text"
                          placeholder="yourname@okbank"
                          autoComplete="off"
                          value={instrument.vpa}
                          onChange={(e) =>
                            updateInstrument({ ...instrument, vpa: e.target.value })
                          }
                          error={
                            instrument.vpa.length > 0 && !isValidVpa(instrument.vpa)
                              ? "Enter a valid UPI ID like name@bank"
                              : undefined
                          }
                        />
                        {isValidVpa(instrument.vpa) ? (
                          <p className="text-xs text-success-600">Looks good — ready to pay.</p>
                        ) : (
                          <p className="text-[11px] text-surface-400">
                            Demo UPI ID: <code>demo@ybl</code> succeeds ·{" "}
                            <code>fail@ybl</code> declines
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── Card ── */}
                    {selectedMethod === "card" && isCard && (
                      <div className="space-y-3">
                        <div>
                          <span className="mb-1.5 block text-xs font-semibold text-surface-700">
                            Card type
                          </span>
                          <div className="flex gap-1.5">
                            {(["credit", "debit"] as const).map((kind) => {
                              const active = instrument.isCredit === (kind === "credit");
                              return (
                                <button
                                  key={kind}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() =>
                                    updateInstrument({ ...instrument, isCredit: kind === "credit" })
                                  }
                                  className={chipClass(active)}
                                >
                                  {active && <Check size={12} />}
                                  {kind}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <Input
                          label="Cardholder Name"
                          placeholder="Name on card"
                          autoComplete="cc-name"
                          value={instrument.cardholderName}
                          onChange={(e) =>
                            updateInstrument({ ...instrument, cardholderName: e.target.value })
                          }
                          error={
                            instrument.cardholderName.length > 0 && instrument.cardholderName.trim().length < 2
                              ? "Enter the name printed on the card"
                              : undefined
                          }
                        />

                        <div>
                          <Input
                            label="Card Number"
                            placeholder="1234 5678 9012 3456"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            value={instrument.number}
                            onChange={(e) => {
                              const next = { ...instrument, number: formatCardNumber(e.target.value) };
                              next.network = detectCardNetwork(next.number);
                              updateInstrument(next);
                            }}
                            error={
                              instrument.number.length > 0 && !isValidCardNumber(instrument.number)
                                ? "Card number looks incomplete"
                                : undefined
                            }
                          />
                          <p className="mt-1 text-[11px] text-surface-400">
                            {instrument.number.length >= 8
                              ? `${getNetworkLabel(detectCardNetwork(instrument.number))} detected`
                              : "Demo test card: 4111 1111 1111 1111"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <Input
                            label="Expiry"
                            placeholder="MM/YY"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            value={instrument.expiry}
                            onChange={(e) =>
                              updateInstrument({ ...instrument, expiry: formatExpiry(e.target.value) })
                            }
                            error={
                              instrument.expiry.length > 0 && !isValidExpiry(instrument.expiry)
                                ? "Invalid or past expiry"
                                : undefined
                            }
                          />
                          <Input
                            label="CVV"
                            placeholder="123"
                            type="password"
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            maxLength={4}
                            value={instrument.cvv}
                            onChange={(e) =>
                              updateInstrument({ ...instrument, cvv: e.target.value.replace(/\D/g, "") })
                            }
                            error={
                              instrument.cvv.length > 0 && instrument.cvv.length < 3
                                ? "CVV must be 3-4 digits"
                                : undefined
                            }
                          />
                        </div>

                        {isValidCardNumber(instrument.number) &&
                          isValidExpiry(instrument.expiry) &&
                          instrument.cvv.length >= 3 && (
                            <p className="text-xs text-success-600">
                              Card ready to use for this payment.
                            </p>
                          )}
                      </div>
                    )}

                    {/* ── Net Banking ── */}
                    {selectedMethod === "net_banking" && isNetBanking && (
                      <div className="space-y-3">
                        <Select
                          label="Select your bank"
                          placeholder="Choose a bank"
                          options={NETBANKING_BANKS.map((b) => ({ label: b.label, value: b.value }))}
                          value={instrument.bank}
                          onChange={(e) => updateInstrument({ ...instrument, bank: e.target.value })}
                        />
                        <p className="flex items-center gap-1.5 text-xs text-surface-400">
                          <Info size={12} />
                          You'll be redirected to your bank's secured page to complete the payment.
                        </p>
                        {instrument.bank === "fail" && (
                          <p className="text-xs text-danger-600">
                            Demo hint: this bank gateway is configured to decline.
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── Wallet ── */}
                    {selectedMethod === "wallet" && isWallet && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-surface-700">Choose a wallet</p>
                        <div className="flex flex-wrap gap-1.5">
                          {WALLETS.map((wallet) => {
                            const active = instrument.wallet === wallet.value;
                            return (
                              <button
                                key={wallet.value}
                                type="button"
                                aria-pressed={active}
                                onClick={() => updateInstrument({ ...instrument, wallet: wallet.value })}
                                className={chipClass(active)}
                              >
                                {active ? (
                                  <Check size={12} />
                                ) : (
                                  <Wallet size={12} className="shrink-0 text-surface-400" />
                                )}
                                {wallet.label}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-surface-400">
                          Demo: Paytm Wallet has a ₹25,000 sandbox balance.
                        </p>
                      </div>
                    )}

                    {/* ── EMI ── */}
                    {selectedMethod === "emi" && isEmi && (
                      <div className="space-y-3">
                        <Select
                          label="EMI provider"
                          placeholder="Select a bank"
                          options={EMI_BANKS.map((b) => ({ label: b.label, value: b.value }))}
                          value={instrument.bank}
                          onChange={(e) => updateInstrument({ ...instrument, bank: e.target.value })}
                        />
                        <Input
                          label="Cardholder Name"
                          placeholder="Name on card"
                          autoComplete="cc-name"
                          value={instrument.cardholderName}
                          onChange={(e) =>
                            updateInstrument({ ...instrument, cardholderName: e.target.value })
                          }
                          error={
                            instrument.cardholderName.length > 0 &&
                            instrument.cardholderName.trim().length < 2
                              ? "Enter the name printed on the card"
                              : undefined
                          }
                        />

                        <div>
                          <p className="mb-1.5 text-xs font-semibold text-surface-700">
                            Select tenure
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {EMI_TENURES.map((tenure) => {
                              const active = instrument.tenureMonths === tenure.value;
                              return (
                                <button
                                  key={tenure.value}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() =>
                                    updateInstrument({ ...instrument, tenureMonths: tenure.value })
                                  }
                                  className={chipClass(active)}
                                >
                                  {active && <Check size={12} />}
                                  {tenure.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {monthlyEmi !== null && instrument.tenureMonths > 0 && (
                          <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
                            Approx. {formatCurrency(monthlyEmi)} / month for {instrument.tenureMonths} months
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SandboxPaymentInfo />

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-surface-400">
        <ShieldCheck size={12} className="text-success-600" />
        <span>256-bit encrypted. We never store your full card details.</span>
      </div>
    </div>
  );
}

export type { PaymentMethodPageProps };