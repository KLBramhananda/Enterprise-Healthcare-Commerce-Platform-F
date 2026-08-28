/**
 * SandboxPaymentInfo
 *
 * Development-only, compact demo-credentials panel for the mock payment
 * gateway. Lets demo users simulate Success / Declined / Pending outcomes.
 *
 * ISOLATION: this component is self-contained and only renders in dev builds.
 * Delete this file (and its single usage in PaymentMethodPage) when Razorpay
 * integration begins — no other part of the checkout depends on it.
 */

import { useState, type ReactNode } from "react";
import { Check, ChevronDown, FlaskConical, X, Clock3 } from "lucide-react";
import { cn } from "@/utils/cn";
import { isDevelopment } from "@/config/env";

const SIM_OPTIONS = [
  {
    value: "success",
    label: "Success",
    icon: Check,
    dot: "bg-success-600",
    inset: "text-success-700",
    hint: "use demo@ybl or card XXXX …1111",
  },
  {
    value: "failure",
    label: "Declined",
    icon: X,
    dot: "bg-danger-600",
    inset: "text-danger-700",
    hint: "use fail@ybl or card ending 0002",
  },
  {
    value: "pending",
    label: "Pending",
    icon: Clock3,
    dot: "bg-warning-600",
    inset: "text-warning-800",
    hint: "use funds@ybl or card ending 0003 to see insufficient funds",
  },
] as const;

type SimValue = (typeof SIM_OPTIONS)[number]["value"];

function CredentialRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[92px_1fr] items-start gap-2">
      <span className="text-[11px] text-info-800/70">{label}</span>
      <div className="min-w-0 text-[11px] text-info-800">{children}</div>
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-surface-0 px-1 py-px font-mono text-[10px] text-surface-700">
      {children}
    </code>
  );
}

export default function SandboxPaymentInfo() {
  const [sim, setSim] = useState<SimValue>("success");

  if (!isDevelopment) return null;

  const activeOption = SIM_OPTIONS.find((o) => o.value === sim);

  return (
    <details className="group mt-3 rounded-lg border border-info-200 bg-info-50/60 px-3 py-2 text-xs text-info-800">
      <summary className="flex cursor-pointer select-none items-center gap-2 font-medium">
        <FlaskConical size={14} className="text-info-600" />
        Sandbox Payment Info
        <span className="rounded-full bg-info-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-info-800">
          Demo
        </span>
        <ChevronDown
          size={13}
          className="ml-auto text-info-600 transition-transform duration-fast ease-smooth group-open:rotate-180"
        />
      </summary>

      <div className="mt-2 space-y-1.5 border-t border-info-100 pt-2">
        <CredentialRow label="UPI ID">
          <Code>demo@ybl</Code> succeeds · <Code>fail@ybl</Code> declines ·{" "}
          <Code>funds@ybl</Code> insufficient funds
        </CredentialRow>
        <CredentialRow label="Test card">
          <Code>4111 1111 1111 1111</Code> · any future expiry · CVV <Code>123</Code>
          <span className="inline-flex flex-wrap gap-x-1.5">
            · endings <Code>…0002</Code> decline · <Code>…0003</Code> insufficient funds
          </span>
        </CredentialRow>
        <CredentialRow label="Demo wallet">
          <Code>Paytm Wallet</Code> with ₹25,000 sandbox balance
        </CredentialRow>
        <CredentialRow label="Demo bank">
          <Code>HDFC Bank</Code> works · select{" "}
          <Code>Axis Bank (demo fail)</Code> to simulate a decline
        </CredentialRow>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {SIM_OPTIONS.map((option) => {
          const active = sim === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => setSim(option.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                  ? "border-info-600 bg-info-100 text-info-800"
                  : "border-info-200 bg-surface-0 text-info-800/70 hover:border-info-300",
              )}
            >
              <Icon size={11} className={active ? option.inset : "text-info-600"} />
              {option.label}
            </button>
          );
        })}
        {activeOption && (
          <p className="w-full text-[11px] text-info-800/70">
            Simulate <span className="font-medium text-info-800">{activeOption.label}:</span>{" "}
            {activeOption.hint}
          </p>
        )}
      </div>
    </details>
  );
}