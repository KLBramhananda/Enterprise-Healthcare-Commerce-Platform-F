/**
 * Payment formatting & validation helpers.
 * Keeps card/UPI/EMI editing consistent across checkout + payment screens.
 */

import type {
  CardNetwork,
  PaymentInstrument,
  PaymentMethodType,
} from "@/types/checkout";
import { CARD_NETWORK_LABELS, PAYMENT_METHOD_LABELS } from "@/config/checkout";

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function detectCardNetwork(number: string): CardNetwork {
  const digits = number.replace(/\D/g, "");
  if (/^4/.test(digits)) return "visa";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  return "rupay";
}

export function maskCardNumber(number: string): string {
  const digits = number.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  return `•••• ${last4}`;
}

export function isValidCardNumber(number: string): boolean {
  return number.replace(/\D/g, "").length >= 12;
}

export function isValidExpiry(expiry: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const candidate = new Date(year, month, 0, 23, 59, 59);
  return candidate.getTime() >= now.getTime();
}

export function isValidVpa(vpa: string): boolean {
  const normalized = vpa.trim().toLowerCase();
  return /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(normalized) && normalized.includes("@");
}

/** Validate that a chosen payment method has a usable instrument. */
export function isPaymentInstrumentValid(
  method: PaymentMethodType | null,
  instrument: PaymentInstrument | null,
): boolean {
  if (!method || !instrument) return false;
  switch (method) {
    case "cod":
      return instrument.kind === "cod";
    case "upi":
      return instrument.kind === "upi" && isValidVpa(instrument.vpa);
    case "card":
      return (
        instrument.kind === "card" &&
        instrument.cardholderName.trim().length > 1 &&
        isValidCardNumber(instrument.number) &&
        isValidExpiry(instrument.expiry) &&
        instrument.cvv.length >= 3
      );
    case "net_banking":
      return instrument.kind === "net_banking" && instrument.bank.length > 0;
    case "wallet":
      return instrument.kind === "wallet" && instrument.wallet.length > 0;
    case "emi":
      return (
        instrument.kind === "emi" &&
        instrument.bank.length > 0 &&
        instrument.tenureMonths > 0 &&
        instrument.cardholderName.trim().length > 1
      );
    default:
      return false;
  }
}

/** Human-readable summary of a chosen payment instrument. */
export function describeInstrument(
  method: PaymentMethodType,
  instrument: PaymentInstrument,
): string {
  switch (method) {
    case "cod":
      return PAYMENT_METHOD_LABELS.cod;
    case "upi": {
      const app = instrument.kind === "upi" && instrument.app ? ` (${instrument.app})` : "";
      return `UPI${app} • ${instrument.kind === "upi" ? instrument.vpa : ""}`;
    }
    case "card": {
      const suffix = instrument.kind === "card" ? ` ${maskCardNumber(instrument.number)}` : "";
      return `${PAYMENT_METHOD_LABELS.card}${suffix}`;
    }
    case "net_banking":
      return `Net Banking • ${instrument.kind === "net_banking" ? instrument.bank : ""}`;
    case "wallet":
      return `Wallet • ${instrument.kind === "wallet" ? instrument.wallet : ""}`;
    case "emi":
      return `EMI • ${instrument.kind === "emi" ? `${instrument.bank} (${instrument.tenureMonths} months)` : ""}`;
    default:
      return method;
  }
}

/** Simple amortized monthly EMI estimate (no-cost style illustration). */
export function calculateMonthlyEmi(
  principal: number,
  months: number,
  annualRate = 0.13,
): number {
  if (months <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const monthlyRate = annualRate / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function getNetworkLabel(network: CardNetwork): string {
  return CARD_NETWORK_LABELS[network] ?? network;
}