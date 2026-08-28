/**
 * usePayment
 *
 * React Query hooks for the payment catalog/stages plus a runnable state
 * machine (`usePaymentRun`) that reveals gateway stages while the mock
 * gateway processes the payment in the background.
 */

import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { services } from "@/services/factory";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import type {
  PaymentProcessingInput,
  PaymentResult,
  PaymentStage,
  PaymentStageId,
} from "@/types/checkout";

const paymentService = services.payment;
const checkoutService = services.checkout;

const SCREEN_STAGE_DWELL_MS = 430;

const PAYMENT_METHODS_QUERY = ["payment-methods"];
const STAGES_QUERY = ["payment-stages"];

export function usePaymentMethods() {
  return useQuery({
    queryKey: PAYMENT_METHODS_QUERY,
    queryFn: () => paymentService.getPaymentMethods(),
    staleTime: Infinity,
  });
}

export function usePaymentStages() {
  return useQuery({
    queryKey: STAGES_QUERY,
    queryFn: () => paymentService.getStages(),
    staleTime: Infinity,
  });
}

export type PaymentRunState = "idle" | "processing" | "succeeded" | "failed";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface PaymentRun {
  state: PaymentRunState;
  currentStage: PaymentStage | null;
  completedStageIds: PaymentStageId[];
  outcome: PaymentResult | null;
  run: (input: PaymentProcessingInput) => Promise<PaymentResult>;
  reset: () => void;
}

export function usePaymentRun(): PaymentRun {
  const [state, setState] = useState<PaymentRunState>("idle");
  const [currentStage, setCurrentStage] = useState<PaymentStage | null>(null);
  const [completedStageIds, setCompletedStageIds] = useState<PaymentStageId[]>([]);
  const [outcome, setOutcome] = useState<PaymentResult | null>(null);
  const runIdRef = useRef(0);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    setState("idle");
    setCurrentStage(null);
    setCompletedStageIds([]);
    setOutcome(null);
  }, []);

  const run = useCallback(
    async (input: PaymentProcessingInput): Promise<PaymentResult> => {
      const runId = ++runIdRef.current;
      setState("processing");
      setCurrentStage(null);
      setCompletedStageIds([]);
      setOutcome(null);

      const stages =
        (await paymentService.getStages().catch(() => [])) ?? [];

      const outcomePromise = paymentService
        .processPayment(input)
        .catch<PaymentResult>(() => ({
          status: "failed",
          stage: "connecting",
          reason: "network_error",
          message: "We couldn't reach the payment gateway. Please try again.",
        }));

      for (const stage of stages) {
        if (runIdRef.current !== runId) return outcomePromise;
        setCurrentStage(stage);
        setCompletedStageIds((prev) => [...prev, stage.id]);

        const settled = await Promise.race([
          outcomePromise.then((result) => ({ kind: "outcome" as const, result })),
          wait(SCREEN_STAGE_DWELL_MS).then(() => ({ kind: "dwell" as const })),
        ]);

        if (settled.kind === "outcome" && settled.result.status === "failed") {
          if (runIdRef.current !== runId) return settled.result;
          setOutcome(settled.result);
          setState("failed");
          return settled.result;
        }
      }

      const final = await outcomePromise;
      if (runIdRef.current !== runId) return final;
      setOutcome(final);
      setState(final.status === "succeeded" ? "succeeded" : "failed");
      return final;
    },
    [],
  );

  return { state, currentStage, completedStageIds, outcome, run, reset };
}

/**
 * Confirm the order payment once the gateway reports success and hand the
 * final order to the persisted store (used by the payment processing page).
 */
export function useFinalizePayment(
  navigate: (path: string) => void,
) {
  const addOrder = useCheckoutStore((s) => s.addOrder);
  const resetSession = useCheckoutStore((s) => s.resetSession);
  const clearCart = useCartStore((s) => s.clearCart);

  return useCallback(
    async (orderId: string, payment: {
      method: PaymentProcessingInput["method"];
      status: "paid";
      transactionId: string;
      paidAt: string;
      instrumentSummary?: string;
    }): Promise<{ ok: boolean; orderId?: string }> => {
      try {
        const updated = await checkoutService.confirmPayment(orderId, {
          method: payment.method,
          status: "paid",
          transactionId: payment.transactionId,
          paidAt: payment.paidAt,
          instrumentSummary: payment.instrumentSummary,
        });
        addOrder(updated);
        clearCart();
        resetSession();
        navigate(`/orders/${updated.id}/confirmation`);
        return { ok: true, orderId: updated.id };
      } catch {
        return { ok: false };
      }
    },
    [addOrder, clearCart, resetSession, navigate],
  );
}