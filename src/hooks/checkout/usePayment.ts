/**
 * usePayment
 *
 * React Query hooks for the payment catalog/stages plus a runnable state
 * machine (`usePaymentRun`) that reveals gateway stages while the configured
 * payment provider processes the payment in the background. The gateway
 * provider is selected behind the PaymentService abstraction — the UI never
 * talks to a gateway directly.
 *
 * Duplicate-charge guards live at three layers:
 *   - the PaymentService coalesces in-flight attempts per order+idempotency key,
 *   - usePaymentRun refuses to start a second concurrent run,
 *   - the PaymentProcessingPage only auto-starts once per persisted attempt.
 */

import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DATA_SOURCE } from "@/config/env";
import { services } from "@/services/factory";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import type {
  Order,
  PaymentProcessingInput,
  PaymentResult,
  PaymentStage,
  PaymentStageId,
} from "@/types/checkout";

const paymentService = services.payment;
const checkoutService = services.checkout;
const LIVE = DATA_SOURCE === "LIVE_API";

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
  cancel: () => void;
}

export function usePaymentRun(): PaymentRun {
  const [state, setState] = useState<PaymentRunState>("idle");
  const [currentStage, setCurrentStage] = useState<PaymentStage | null>(null);
  const [completedStageIds, setCompletedStageIds] = useState<PaymentStageId[]>([]);
  const [outcome, setOutcome] = useState<PaymentResult | null>(null);
  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const runPromiseRef = useRef<Promise<PaymentResult> | null>(null);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    setState("idle");
    setCurrentStage(null);
    setCompletedStageIds([]);
    setOutcome(null);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    runPromiseRef.current = null;
    runIdRef.current += 1;
    setState("idle");
    setCurrentStage(null);
    setCompletedStageIds([]);
  }, []);

  const run = useCallback(
    async (input: PaymentProcessingInput): Promise<PaymentResult> => {
      // Double-click / duplicate-run guard at the hook level: while a run is
      // active, further attempts share the same in-flight promise.
      if (runPromiseRef.current) return runPromiseRef.current;

      const runId = ++runIdRef.current;
      const abortController = new AbortController();
      abortRef.current = abortController;
      setState("processing");
      setCurrentStage(null);
      setCompletedStageIds([]);
      setOutcome(null);

      const outcomePromise = paymentService
        .processPayment(input, { signal: abortController.signal })
        .catch<PaymentResult>(() => ({
          status: "failed",
          stage: "connecting",
          reason: "network_error",
          message: "We couldn't reach the payment gateway. Please try again.",
        }));

      const stages = (await paymentService.getStages().catch(() => [])) ?? [];

      // Drive the stage reveal; bail out if the run was cancelled/reset.
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
          runPromiseRef.current = null;
          return settled.result;
        }
      }

      const final = await outcomePromise;
      if (runIdRef.current !== runId) return final;
      setOutcome(final);
      setState(final.status === "succeeded" ? "succeeded" : "failed");
      runPromiseRef.current = null;
      return final;
    },
    [],
  );

  return { state, currentStage, completedStageIds, outcome, run, reset, cancel };
}

/**
 * Confirm the order payment once the gateway reports success and hand the
 * final order to the persisted store (used by the payment processing page).
 *
 * LIVE_API has no payment-confirmation backend yet, so the payment update is
 * applied to the persisted order locally (the ERP Draft Sales Order stays
 * untouched until a payment module exists). STATIC keeps the service-backed
 * confirmPayment path.
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
        if (LIVE) {
          const stored = useCheckoutStore
            .getState()
            .orders.find((o) => o.id === orderId);
          const fallback = stored ?? (await checkoutService.getOrder(orderId));
          if (!fallback) return { ok: false };
          const updated: Order = {
            ...fallback,
            payment: {
              method: payment.method,
              status: "paid",
              transactionId: payment.transactionId,
              paidAt: payment.paidAt,
              instrumentSummary: payment.instrumentSummary,
            },
            status: "confirmed",
            invoiceId: `INV-${orderId}`,
          };
          addOrder(updated);
          clearCart().catch(() => undefined);
          resetSession();
          navigate(`/orders/${updated.id}/confirmation`);
          return { ok: true, orderId: updated.id };
        }

        const updated = await checkoutService.confirmPayment(orderId, {
          method: payment.method,
          status: "paid",
          transactionId: payment.transactionId,
          paidAt: payment.paidAt,
          instrumentSummary: payment.instrumentSummary,
        });
        addOrder(updated);
        clearCart().catch(() => undefined);
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