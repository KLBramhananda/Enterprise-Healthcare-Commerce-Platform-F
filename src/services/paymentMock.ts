/**
 * Mock Payment Service
 *
 * Frontend-only simulation of a payment gateway for demos / local dev.
 * Implements the IPaymentService contract with a deterministic
 * "test instrument" convention (no real money, no external SDK):
 *
 *   - UPI VPA     `anything@fail`   → Declined (stage: authorizing)
 *   - UPI VPA     `anything@funds`  → Insufficient funds
 *   - Card ending `0002`            → Declined (stage: authorizing)
 *   - Card ending `0003`            → Insufficient funds
 *   - Card ending `0000`            → Invalid details (stage: verifying)
 *   - Card expiry `00/00`           → Invalid details (stage: verifying)
 *   - Net banking / wallet / EMI id `fail` → Declined at first contact
 *
 * Any other instrument succeeds and returns a synthetic transaction id.
 */

import type {
  PaymentFailureResult,
  PaymentMethod,
  PaymentProcessingInput,
  PaymentResult,
  PaymentStage,
  PaymentStageId,
} from "@/types/checkout";
import type { IPaymentService } from "./paymentService";

const PAYMENT_METHODS: PaymentMethod[] = [
  { type: "cod", label: "Cash on Delivery", description: "Pay when your order arrives" },
  { type: "upi", label: "UPI", description: "Google Pay, PhonePe, Paytm, BHIM" },
  { type: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, RuPay, Amex" },
  { type: "net_banking", label: "Net Banking", description: "All major banks supported" },
  { type: "wallet", label: "Wallets", description: "Paytm, Amazon Pay, etc." },
  { type: "emi", label: "EMI", description: "No-cost monthly installments on cards" },
];

const STAGES: PaymentStage[] = [
  { id: "connecting", label: "Connecting to payment gateway", description: "Establishing a secure connection" },
  { id: "authorizing", label: "Authorizing payment", description: "Contacting your bank" },
  { id: "verifying", label: "Verifying transaction", description: "Confirming payment details" },
  { id: "generating_order", label: "Generating order", description: "Locking in your order" },
  { id: "creating_invoice", label: "Creating invoice", description: "Preparing your invoice" },
  { id: "finalizing", label: "Finalizing purchase", description: "Almost done" },
];

const STAGE_INDEX: Record<PaymentStageId, number> = {
  connecting: 0,
  authorizing: 1,
  verifying: 2,
  generating_order: 3,
  creating_invoice: 4,
  finalizing: 5,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectFailure(input: PaymentProcessingInput): PaymentFailureResult | null {
  const { method, instrument } = input;

  if (method === "cod") return null;

  if (method === "upi" && instrument.kind === "upi") {
    const vpa = instrument.vpa.trim().toLowerCase();
    if (vpa.includes("@funds")) {
      return {
        status: "failed",
        stage: "authorizing",
        reason: "insufficient_funds",
        message: "Insufficient balance in your UPI account. Please check and try again.",
      };
    }
    if (vpa.includes("@fail")) {
      return {
        status: "failed",
        stage: "authorizing",
        reason: "declined",
        message: "Your bank declined this payment. Please use a different payment method.",
      };
    }
    if (!instrument.vpa.includes("@")) {
      return {
        status: "failed",
        stage: "verifying",
        reason: "invalid_details",
        message: "The UPI ID looks invalid. Please check and try again.",
      };
    }
  }

  if (method === "card" && instrument.kind === "card") {
    const last4 = instrument.number.replace(/\s+/g, "").slice(-4);
    if (last4 === "0000" || instrument.expiry === "00/00") {
      return {
        status: "failed",
        stage: "verifying",
        reason: "invalid_details",
        message: "We couldn't verify your card details. Please check and try again.",
      };
    }
    if (last4 === "0003") {
      return {
        status: "failed",
        stage: "authorizing",
        reason: "insufficient_funds",
        message: "Your card doesn't have sufficient funds for this purchase.",
      };
    }
    if (last4 === "0002") {
      return {
        status: "failed",
        stage: "authorizing",
        reason: "declined",
        message: "Your bank declined this transaction. Please try another card or payment method.",
      };
    }
  }

  const failId: Record<string, { stage: PaymentStageId; reason: PaymentFailureResult["reason"]; message: string }> = {
    net_banking: {
      stage: "connecting",
      reason: "declined",
      message: "Your bank's gateway was unavailable. Please try again or choose another option.",
    },
    wallet: {
      stage: "authorizing",
      reason: "insufficient_funds",
      message: "Your wallet balance is insufficient for this purchase.",
    },
    emi: {
      stage: "connecting",
      reason: "declined",
      message: "The EMI provider declined the credit offer. Please try another option.",
    },
  };

  const failureSpec = failId[method];
  if (failureSpec) {
    const idValue =
      (instrument as { vpa?: string; bank?: string; wallet?: string }).bank ??
      (instrument as { wallet?: string }).wallet ??
      "";
    if (idValue === "fail") {
      return { status: "failed", stage: failureSpec.stage, reason: failureSpec.reason, message: failureSpec.message };
    }
  }

  return null;
}

export class MockPaymentService implements IPaymentService {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    await delay(120);
    return [...PAYMENT_METHODS];
  }

  async getStages(): Promise<PaymentStage[]> {
    await delay(80);
    return [...STAGES];
  }

  async processPayment(input: PaymentProcessingInput): Promise<PaymentResult> {
    // Simulate gateway round-trip. Runtime total ~1.6s so the processing
    // screen can reveal the visual stages in near-sync.
    await delay(1600);

    const failure = detectFailure(input);
    if (failure) {
      // Give the UI enough time to reach the failing stage visually.
      const anchorMs = (STAGE_INDEX[failure.stage] + 1) * 380;
      const remaining = Math.max(anchorMs - 1600, 0);
      if (remaining > 0) await delay(remaining);
      return failure;
    }

    return {
      status: "succeeded",
      transactionId: `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      method: input.method,
      amount: input.amount,
      paidAt: new Date().toISOString(),
    };
  }
}

export type { IPaymentService } from "./paymentService";