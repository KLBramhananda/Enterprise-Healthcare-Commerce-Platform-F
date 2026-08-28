/**
 * Payment Service Interface
 *
 * Defines the contract for the mock payment gateway.
 * The UI depends ONLY on this interface, so a real aggregator
 * (Razorpay, Stripe, etc.) can be swapped in by providing an
 * implementation without touching any component.
 */

import type {
  PaymentMethod,
  PaymentProcessingInput,
  PaymentResult,
  PaymentStage,
} from "@/types/checkout";

export interface IPaymentService {
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getStages(): Promise<PaymentStage[]>;
  processPayment(input: PaymentProcessingInput): Promise<PaymentResult>;
}