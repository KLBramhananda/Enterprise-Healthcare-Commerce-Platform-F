/**
 * Payment Service (orchestrator)
 *
 * The single payment facade used by the checkout/payment UI. It owns the
 * gateway-agnostic parts of a charge attempt so nothing in the UI needs to
 * know which aggregator is active:
 *
 *   - duplicate-charge / double-click prevention (in-flight attempts coalesce
 *     on the same order + idempotency key),
 *   - session timeout enforcement (default `PAYMENT_TIMEOUT_MS`),
 *   - provider errors normalised into stable `PaymentFailureResult` values,
 *   - cancellation via AbortSignal (PaymentProcessingPage cancel action).
 *
 * It NEVER calls a payment provider directly: the injected
 * IPaymentGatewayProvider does. Swapping Razorpay for Stripe (or wiring the
 * first real gateway) only changes the factory — the UI and this facade stay
 * untouched.
 */

import type {
  PaymentMethod,
  PaymentProcessingInput,
  PaymentResult,
  PaymentStage,
} from "@/types/checkout";
import type { IPaymentGatewayProvider } from "./paymentGateway";

export interface IPaymentService {
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getStages(): Promise<PaymentStage[]>;
  processPayment(
    input: PaymentProcessingInput,
    options?: { signal?: AbortSignal },
  ): Promise<PaymentResult>;
}

function timeoutResult(): PaymentResult {
  return {
    status: "failed",
    stage: "connecting",
    reason: "timeout",
    message: "The payment session timed out. Please try again.",
  };
}

function networkErrorResult(): PaymentResult {
  return {
    status: "failed",
    stage: "connecting",
    reason: "network_error",
    message: "We couldn't reach the payment provider. Please try again.",
  };
}

export class PaymentService implements IPaymentService {
  private readonly provider: IPaymentGatewayProvider;
  private readonly timeoutMs: number;

  constructor(provider: IPaymentGatewayProvider, timeoutMs: number) {
    this.provider = provider;
    this.timeoutMs = timeoutMs;
  }

  /** Coalescing map for in-flight attempts (key = orderId::idempotencyKey). */
  private readonly inflight = new Map<string, Promise<PaymentResult>>();

  getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.provider.getPaymentMethods();
  }

  getStages(): Promise<PaymentStage[]> {
    return this.provider.getStages();
  }

  /**
   * Process a payment attempt. Concurrent calls for the same order + key share
   * one provider invocation (double-click / duplicate-tab protection). A
   * settled attempt is NOT cached: a user-initiated retry may re-run the
   * provider with the same idempotency key, which is safe because the real
   * gateway dedupes server-side by that key.
   */
  async processPayment(
    input: PaymentProcessingInput,
    options: { signal?: AbortSignal } = {},
  ): Promise<PaymentResult> {
    if (options.signal?.aborted) return timeoutResult();

    const key = input.idempotencyKey
      ? `${input.orderId}::${input.idempotencyKey}`
      : input.orderId;
    const running = this.inflight.get(key);
    if (running) return running;

    const attempt = this.runAttempt(input, options);
    this.inflight.set(key, attempt);
    void attempt.finally(() => {
      if (this.inflight.get(key) === attempt) this.inflight.delete(key);
    });
    return attempt;
  }

  private runAttempt(
    input: PaymentProcessingInput,
    options: { signal?: AbortSignal },
  ): Promise<PaymentResult> {
    const { signal } = options;
    return new Promise<PaymentResult>((resolve) => {
      let timer = 0;
      let settled = false;

      const cleanup = () => {
        window.clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
      };
      const settle = (result: PaymentResult) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(result);
      };
      const onAbort = () => settle(timeoutResult());

      if (signal?.aborted) {
        settle(timeoutResult());
        return;
      }

      timer = window.setTimeout(() => settle(timeoutResult()), this.timeoutMs);
      signal?.addEventListener("abort", onAbort, { once: true });

      this.provider.processPayment(input, { signal }).then(
        (result) => settle(result),
        () => settle(networkErrorResult()),
      );
    });
  }
}