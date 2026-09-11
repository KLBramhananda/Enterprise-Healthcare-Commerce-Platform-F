/**
 * Payment Gateway Providers
 *
 * Concrete IPaymentGatewayProvider implementations selected by the service
 * factory:
 *
 *   - SandboxPaymentProvider: frontend simulation of a gateway used by STATIC
 *     mode only (real aggregator stand-in; no real money, no external SDK).
 *     Deterministic "test instrument" convention:
 *       - UPI VPA     `anything@timeout` → timed out (stage: connecting)
 *       - UPI VPA     `anything@offline` → network error; provider REJECTS so
 *         the PaymentService normalises it into a `network_error` result
 *       - UPI VPA     `anything@fail`   → Declined (stage: authorizing)
 *       - UPI VPA     `anything@funds`  → Insufficient funds
 *       - Card ending `0002`            → Declined (stage: authorizing)
 *       - Card ending `0003`            → Insufficient funds
 *       - Card ending `0000`            → Invalid details (stage: verifying)
 *       - Card expiry `00/00`           → Invalid details (stage: verifying)
 *       - Net banking / wallet / EMI id `fail` → Declined at first contact
 *     Any other instrument succeeds and returns a synthetic transaction id.
 *
 *     Production-hardened to behave like a real gateway under the edge cases
 *     the orchestrator/UI care about:
 *       - idempotent success replay: a second attempt for the same order +
 *         idempotency key returns the SAME transaction instead of charging
 *         again (in-memory ledger; failures are never memorized so a retry
 *         re-runs the gateway and can succeed);
 *       - abort-awareness: honours the caller's AbortSignal and settles as
 *         soon as the run is cancelled instead of continuing a fake delay and
 *         (critically) never recording a success for an aborted attempt;
 *       - stage-aligned timing: the round trip is synchronised to the
 *         processing-screen stage reveal (430 ms per stage) so a success
 *         lands right after the final stage and a failure surfaces exactly at
 *         the stage where it happened.
 *
 *   - GatewayUnavailableProvider: honest placeholder used by LIVE_API until a
 *     real aggregator is integrated. Never simulates a charge — online
 *     payments fail closed with `gateway_unavailable`; COD is unaffected.
 */

import type {
  PaymentFailureResult,
  PaymentMethod,
  PaymentProcessingInput,
  PaymentResult,
  PaymentStage,
  PaymentStageId,
  PaymentSuccessResult,
} from "@/types/checkout";
import type { IPaymentGatewayProvider } from "./paymentGateway";

export const PAYMENT_METHODS: PaymentMethod[] = [
  { type: "cod", label: "Cash on Delivery", description: "Pay when your order arrives" },
  { type: "upi", label: "UPI", description: "Google Pay, PhonePe, Paytm, BHIM" },
  { type: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, RuPay, Amex" },
  { type: "net_banking", label: "Net Banking", description: "All major banks supported" },
  { type: "wallet", label: "Wallets", description: "Paytm, Amazon Pay, etc." },
  { type: "emi", label: "EMI", description: "No-cost monthly installments on cards" },
];

export const STAGES: PaymentStage[] = [
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

/**
 * Must match `SCREEN_STAGE_DWELL_MS` in hooks/checkout/usePayment.ts — the
 * processing screen reveals one stage per 430 ms, so the provider syncs its
 * round trip to that cadence (success after the last stage, failure exactly
 * on the failing stage).
 */
const STAGE_DWELL_MS = 430;

/** How long an online payment round trip takes (one dwell per stage). */
const ONLINE_ROUND_TRIP_MS = STAGES.length * STAGE_DWELL_MS;

/** Short latency for deterministic fast paths (COD confirm, replay lookup). */
const QUICK_ROUND_TRIP_MS = 150;

/**
 * In-memory ledger of successful intents, keyed by order + idempotency key
 * (same convention the PaymentService uses to coalesce in-flight attempts).
 * A re-run for an already-succeeded key replays the exact transaction in scope
 * (same id, same paidAt) instead of issuing a second charge — mirrors how a
 * real gateway dedupes by idempotency key. Replaying is scoped to the app
 * session; across a full page refresh the persisted, finalized order
 * (payment.status === "paid") already redirects to the confirmation page.
 */
const SUCCESS_LEDGER = new Map<string, PaymentSuccessResult>();

const TIMEOUT_FAILURE: PaymentFailureResult = {
  status: "failed",
  stage: "connecting",
  reason: "timeout",
  message: "The payment session timed out. Please try again.",
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * Delay that resolves `false` when `ms` elapses, or `true` as soon as `signal`
 * aborts (so cancelled attempts stop the simulated round trip immediately).
 */
function waitOrAborted(ms: number, signal?: AbortSignal): Promise<boolean> {
  if (signal?.aborted) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (aborted: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      resolve(aborted);
    };
    const onAbort = () => finish(true);
    const timer = window.setTimeout(() => finish(false), ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** UPI VPA ending `@offline` → simulate an unreachable gateway (REJECTS). */
function isSimulatedNetworkError(input: PaymentProcessingInput): boolean {
  return (
    input.method === "upi" &&
    input.instrument.kind === "upi" &&
    input.instrument.vpa.trim().toLowerCase().includes("@offline")
  );
}

function detectFailure(input: PaymentProcessingInput): PaymentFailureResult | null {
  const { method, instrument } = input;

  if (method === "cod") return null;

  if (method === "upi" && instrument.kind === "upi") {
    const vpa = instrument.vpa.trim().toLowerCase();
    if (vpa.includes("@timeout")) {
      return { ...TIMEOUT_FAILURE };
    }
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
    if (!vpa.includes("@")) {
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

function makeTransactionId(): string {
  return `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/** STATIC-mode simulator. Keep behavior identical to the legacy mock gateway. */
export class SandboxPaymentProvider implements IPaymentGatewayProvider {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    await wait(120);
    return [...PAYMENT_METHODS];
  }

  async getStages(): Promise<PaymentStage[]> {
    await wait(80);
    return [...STAGES];
  }

  processPayment(
    input: PaymentProcessingInput,
    options: { signal?: AbortSignal } = {},
  ): Promise<PaymentResult> {
    return this.processPaymentSafe(input, options);
  }

  /**
   * Gateway round trip that always resolves to a typed PaymentResult and never
   * throws (except the deliberate `@offline` network-error simulation, which
   * the PaymentService normalises into `network_error`). An aborted run
   * settles immediately as "timed out" and never records a success.
   */
  private async processPaymentSafe(
    input: PaymentProcessingInput,
    options: { signal?: AbortSignal },
  ): Promise<PaymentResult> {
    const key = input.idempotencyKey
      ? `${input.orderId}::${input.idempotencyKey}`
      : input.orderId;

    // Replay protection: the same order + idempotency key has already
    // succeeded → return the exact same transaction, never a new charge.
    const remembered = SUCCESS_LEDGER.get(key);
    if (remembered) {
      const aborted = await waitOrAborted(QUICK_ROUND_TRIP_MS, options.signal);
      if (aborted) return { ...TIMEOUT_FAILURE };
      return { ...remembered };
    }

    // COD is confirmed on the customer side (never routed through a gateway),
    // so it succeeds immediately with a COD reference — belt-and-braces for
    // any caller that runs the provider directly.
    if (input.method === "cod") {
      const aborted = await waitOrAborted(QUICK_ROUND_TRIP_MS, options.signal);
      if (aborted) return { ...TIMEOUT_FAILURE };
      const result: PaymentSuccessResult = {
        status: "succeeded",
        transactionId: `COD-${input.orderId}`,
        method: "cod",
        amount: input.amount,
        paidAt: new Date().toISOString(),
      };
      SUCCESS_LEDGER.set(key, result);
      return { ...result };
    }

    const failure = detectFailure(input);
    const networkErrorSim = !failure && isSimulatedNetworkError(input);

    // Sync the round trip to the processing screen's stage reveal:
    //  - failure → resolve exactly when the failing stage becomes current;
    //  - network error → fail at the connecting stage;
    //  - success   → resolve right after the final stage so the full list is
    //    revealed before the screen switches to the success state.
    const roundTripMs = failure
      ? (STAGE_INDEX[failure.stage] + 1) * STAGE_DWELL_MS
      : networkErrorSim
        ? STAGE_DWELL_MS
        : ONLINE_ROUND_TRIP_MS;

    const aborted = await waitOrAborted(roundTripMs, options.signal);
    if (aborted) return { ...TIMEOUT_FAILURE };
    if (networkErrorSim) {
      throw new Error("Simulated gateway connection failure (demo @offline VPA).");
    }
    if (failure) return { ...failure };

    const result: PaymentSuccessResult = {
      status: "succeeded",
      transactionId: makeTransactionId(),
      method: input.method,
      amount: input.amount,
      paidAt: new Date().toISOString(),
    };
    SUCCESS_LEDGER.set(key, result);
    return { ...result };
  }
}

/**
 * LIVE_API placeholder. No real aggregator is integrated yet, so online
 * payments fail closed with a clear, routable reason instead of faking a
 * success. COD (no gateway involved) is not affected by this provider.
 */
export class GatewayUnavailableProvider implements IPaymentGatewayProvider {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return [...PAYMENT_METHODS];
  }

  async getStages(): Promise<PaymentStage[]> {
    return [...STAGES];
  }

  async processPayment(): Promise<PaymentResult> {
    return {
      status: "failed",
      stage: "connecting",
      reason: "gateway_unavailable",
      message:
        "Online payments aren't set up for this deployment yet. Please pick Cash on Delivery or try again later.",
    };
  }
}