/**
 * Payment Gateway Provider (strategy)
 *
 * A provider is a thin adapter around ONE concrete payment medium: a real
 * aggregator (Razorpay, Stripe, PhonePe, ...), the local sandbox simulator
 * used by STATIC mode, or the "gateway unavailable" placeholder shipped with
 * LIVE_API until a gateway is wired.
 *
 * The PaymentService orchestrator is the ONLY consumer of this interface:
 * checkout/payment UI code never talks to a provider directly, so plugging in
 * a new aggregator is a factory/factory-in-`paymentProviders` change only.
 */

import type {
  PaymentMethod,
  PaymentProcessingInput,
  PaymentResult,
  PaymentStage,
} from "@/types/checkout";

export interface IPaymentGatewayProvider {
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getStages(): Promise<PaymentStage[]>;
  processPayment(
    input: PaymentProcessingInput,
    options?: { signal?: AbortSignal },
  ): Promise<PaymentResult>;
}