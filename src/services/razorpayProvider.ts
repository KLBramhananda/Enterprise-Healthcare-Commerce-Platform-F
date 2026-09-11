/**
 * Razorpay Provider (placeholder)
 *
 * Stand-in for the real Razorpay integration. Implements IPaymentGatewayProvider
 * so the PaymentService orchestrator and every checkout/payment screen keep
 * working unchanged; the only job of this task is to SELECT the provider, so
 * every charge attempt fails fast with a clear "Not Implemented" result until
 * the real SDK is wired in.
 *
 * The UI/business logic never talk to this class directly (only PaymentService
 * does), which is exactly why it can be swapped later without touching any
 * page, hook, or the orchestration layer.
 */

import type {
  PaymentMethod,
  PaymentResult,
  PaymentStage,
} from "@/types/checkout";
import type { IPaymentGatewayProvider } from "./paymentGateway";
import { PAYMENT_METHODS, STAGES } from "./paymentProviders";

export class RazorpayProvider implements IPaymentGatewayProvider {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return [...PAYMENT_METHODS];
  }

  async getStages(): Promise<PaymentStage[]> {
    return [...STAGES];
  }

  /**
   * Placeholder charge attempt. Fail-closed until the real Razorpay checkout
   * is implemented (load SDK script → open checkout → reconcile the response).
   */
  async processPayment(): Promise<PaymentResult> {
    return {
      status: "failed",
      stage: "connecting",
      reason: "gateway_unavailable",
      message:
        "Razorpay is not implemented yet, so online payments are unavailable. Please try again later or choose Cash on Delivery.",
    };
  }
}