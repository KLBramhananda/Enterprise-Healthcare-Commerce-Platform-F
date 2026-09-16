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
import { paymentConfirmationMessage, type IPaymentConfirmationService } from "@/services/paymentConfirmation";
import { queryClient } from "@/lib/queryClient";
import { invalidateOrderCaches } from "@/utils/orderCache";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { CART_QUERY_KEY } from "@/services/cartService";
import type {
  Order,
  PaymentMethodType,
  PaymentProcessingInput,
  PaymentResult,
  PaymentStage,
  PaymentStageId,
} from "@/types/checkout";
import type { ErpPaymentSessionDTO } from "@/types/erpnextPayment";

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

        // Only transition to "failed" on an early outcome if the payment
        // was definitively declined (not a transient network/timeout error).
        // Transient errors are allowed to continue through the remaining
        // stages so the backend has time to confirm, avoiding a brief false
        // "Payment Failed" flash before the actual success.
        if (
          settled.kind === "outcome" &&
          settled.result.status === "failed" &&
          settled.result.reason !== "network_error" &&
          settled.result.reason !== "timeout" &&
          settled.result.reason !== "gateway_unavailable"
        ) {
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
 * LIVE_API drives the live KeeMeds Commerce payment-confirmation backend
 * (create_payment → verify_payment). Gateway "success" alone never finalizes:
 * the backend must first prove the payment (submit the Sales Order + create/
 * submit a Payment Entry, mark `payment_status = Paid`), then every ERP order
 * cache is invalidated and refreshed, and only then may the success screen be
 * shown. If the backend cannot confirm, the call resolves `{ ok: false }` with
 * a user-facing reason — the order stays unresolved and no navigation happens.
 *
 * STATIC keeps the service-backed confirmPayment path.
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
    }): Promise<{ ok: boolean; orderId?: string; reason?: string }> => {
      if (!LIVE) {
        try {
          const updated = await checkoutService.confirmPayment(orderId, {
            method: payment.method,
            status: "paid",
            transactionId: payment.transactionId,
            paidAt: payment.paidAt,
            instrumentSummary: payment.instrumentSummary,
          });
          clearCart().catch(() => undefined);
          addOrder(updated);
          resetSession();
          navigate(`/orders/${updated.id}/confirmation`);
          return { ok: true, orderId: updated.id };
        } catch (error) {
          return {
            ok: false,
            reason: paymentConfirmationMessage(error, "We couldn't finalize your order."),
          };
        }
      }

      // LIVE_API: the backend is the single source of truth.
      try {
        const stored = useCheckoutStore
          .getState()
          .orders.find((o) => o.id === orderId);
        const fallback = stored ?? (await checkoutService.getOrder(orderId).catch(() => null));
        if (!fallback) return { ok: false, reason: "We couldn't find this order to finalize its payment." };

        const confirmed = await confirmPaymentOnBackend(orderId, payment.method);
        if (!confirmed) {
          return {
            ok: false,
            reason:
              "Your payment succeeded, but the backend could not confirm it. Your order is still safe — please try again or contact support.",
          };
        }

        // ERP has now marked the Sales Order paid (submitted + Payment Entry).
        // Clear the cart server-side and wait for completion so the badge cannot
        // repopulate from a stale server snapshot during cache invalidation.
        try {
          await clearCart();
        } catch {
          // Non-blocking: even if the server cart clear fails, the mirror +
          // React Query cache are force-emptied below so the UI shows 0 items.
        }

        // Belt-and-suspenders: mirror empty cart into the Zustand store and
        // React Query cache BEFORE invalidating order caches, so the header
        // badge shows 0 on the confirmation page regardless of any in-flight
        // refetch.
        useCartStore.getState().hydrate([]);
        queryClient.setQueryData(CART_QUERY_KEY, []);

        // Mirror that state onto the persisted order + reveal success.
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
        resetSession();

        // Reveal the confirmation screen immediately (ERP has confirmed the
        // payment). Cache refresh runs in the background — it must never delay
        // the success navigation, otherwise the reset session (no payment
        // instrument) could flash an incorrect "payment method needed" state on
        // the payment page in the interim.
        navigate(`/orders/${orderId}/confirmation`);
        void invalidateOrderCaches(queryClient, orderId);

        return { ok: true, orderId };
      } catch (error) {
        return {
          ok: false,
          reason: paymentConfirmationMessage(error, "We couldn't finalize your payment."),
        };
      }
    },
    [addOrder, clearCart, resetSession, navigate],
  );
}

/**
 * Drive the live payment-confirmation backend for a successfully charged order.
 *
 * create_payment re/creates the gateway-ready session (returns the signature
 * the sandbox provider produced server-side and the backend expects back on
 * verify). verify_payment then completes it: it validates ownership/amount/
 * signature and, on match, submits the Sales Order, creates/submits the Payment
 * Entry and marks the order Paid.
 *
 * Both calls reconcile against the authoritative payment status when the order
 * was already paid by a concurrent callback (or a previous finalize), so the
 * flow is idempotent and never double-charges.
 */
async function confirmPaymentOnBackend(
  orderId: string,
  method: PaymentMethodType,
): Promise<boolean> {
  const confirmation = services.paymentConfirmation;
  const created = await createPaymentSessionOrReconcile(confirmation, orderId);
  if (created.alreadyPaid) return true;

  if (created.session) {
    try {
      await confirmation.verifyPayment({
        salesOrder: created.session.sales_order,
        session: created.session.session,
        amount: created.session.amount,
        signature: created.session.signature,
        method,
      });
      return true;
    } catch (error) {
      const status = await confirmation.getPaymentStatus({ salesOrder: orderId }).catch(() => null);
      if (status?.status === "Paid") return true;
      await confirmation
        .reportFailure({
          salesOrder: orderId,
          reason: "Payment could not be confirmed after a successful gateway charge.",
        })
        .catch(() => undefined);
      throw error;
    }
  }

  return false;
}

/**
 * create_payment raises when the order is no longer Draft (e.g. a webhook or a
 * previous finalize already paid it) — reconcile against the authoritative
 * payment status and report when the order is already Paid.
 */
async function createPaymentSessionOrReconcile(
  confirmation: IPaymentConfirmationService,
  orderId: string,
): Promise<{ session?: ErpPaymentSessionDTO; alreadyPaid?: boolean }> {
  try {
    return { session: await confirmation.createPaymentSession({ salesOrder: orderId }) };
  } catch (error) {
    const status = await confirmation.getPaymentStatus({ salesOrder: orderId }).catch(() => null);
    if (status?.status === "Paid") return { alreadyPaid: true };
    throw error;
  }
}