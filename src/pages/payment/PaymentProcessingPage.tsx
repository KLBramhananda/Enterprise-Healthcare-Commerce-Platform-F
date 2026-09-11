/**
 * PaymentProcessingPage
 *
 * Rendered at /checkout/payment/:orderId after the wizard creates an order
 * for an online payment method. Runs the configured payment provider (stages
 * at PaymentProcessingScreen), confirms the order on success, and shows retry
 * or change-method actions on failure. The cart is only cleared on success.
 * The attempt is idempotent: one persisted key per order, so a refresh re-runs
 * the same gateway intent and can never double-charge or replay the order.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Container, Button, Loading } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { services } from "@/services/factory";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useAuthStore } from "@/store/authStore";
import {
  usePaymentRun,
  usePaymentStages,
  useFinalizePayment,
} from "@/hooks/checkout/usePayment";
import { PaymentProcessingScreen } from "@/components/checkout";
import { describeInstrument, isPaymentInstrumentValid } from "@/utils/payment";
import { useToast } from "@/providers/ToastProvider";
import type { PaymentScreenState } from "@/components/checkout";
import type { PaymentResult, PaymentSuccessResult } from "@/types/checkout";

const checkoutService = services.checkout;

export default function PaymentProcessingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  usePageTitle("Processing Payment");
  const navigate = useNavigate();
  const { addToast } = useToast();

  const session = useCheckoutStore((s) => s.session);
  const setPaymentAttempt = useCheckoutStore((s) => s.setPaymentAttempt);
  const storedOrder = useCheckoutStore((s) =>
    orderId ? s.orders.find((o) => o.id === orderId) ?? null : null,
  );
  const { data: stages = [] } = usePaymentStages();

  // LIVE_API persists the created order in the checkout store at checkout
  // time, so the payment page reads from there (refresh-safe). Only when no
  // persisted order exists (STATIC mode) do we fall back to the service query.
  const { data: order = storedOrder, isLoading, isError } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => checkoutService.getOrder(orderId as string),
    enabled: Boolean(orderId) && !storedOrder,
  });

  const paymentRun = usePaymentRun();
  const finalize = useFinalizePayment(navigate);
  const autoStartedRef = useRef<string | null>(null);
  const finalizedRef = useRef(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  const attempt = session.paymentAttempt;

  useEffect(() => {
    if (!order || !orderId) return;

    if (order.payment?.status === "paid") {
      navigate(`/orders/${order.id}/confirmation`, { replace: true });
      return;
    }

    if (order.paymentMethod === "cod") {
      navigate(`/orders/${order.id}/confirmation`, { replace: true });
      return;
    }

    // Persist ONE idempotency key for this order. A refresh or a duplicate
    // trigger re-runs the SAME gateway intent (replay / duplicate-charge
    // protection) instead of silently charging again.
    if (!attempt || attempt.orderId !== order.id) {
      setPaymentAttempt({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `pay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        orderId: order.id,
        method: order.paymentMethod,
        amount: order.grandTotal,
        createdAt: new Date().toISOString(),
      });
      return; // effect re-runs once the attempt is persisted
    }

    if (!isPaymentInstrumentValid(order.paymentMethod, session.paymentInstrument)) {
      return;
    }

    if (autoStartedRef.current === attempt.id) return;
    autoStartedRef.current = attempt.id;

    // Suppress auth clearing for the ENTIRE duration of the payment run (not
    // just until run() returns, since it is non-blocking). A transient 401/403
    // from a concurrent request (e.g. cart clear, CSRF refresh) must not
    // destroy the session mid-flow and redirect to login before the payment
    // completes. The flag is re-enabled in handleFinalize (on success) or
    // after the run settles (on failure/cancel).
    useAuthStore.getState().setSuppressPaymentAuthClear(true);
    paymentRun.run({
      orderId: order.id,
      method: order.paymentMethod,
      instrument: session.paymentInstrument!,
      amount: order.grandTotal,
      idempotencyKey: attempt.id,
    }).finally(() => {
      // Re-enable auth clearing once the payment run has settled (succeeded
      // or failed). handleFinalize will re-suppress if backend confirmation
      // is still in progress.
      if (!finalizedRef.current) {
        useAuthStore.getState().setSuppressPaymentAuthClear(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderId, attempt]);

  const screenState: PaymentScreenState =
    paymentRun.state === "idle" ? "processing" : paymentRun.state;

  const instrumentValid = order
    ? isPaymentInstrumentValid(order.paymentMethod, session.paymentInstrument)
    : false;
  const instrumentSummary =
    instrumentValid && order && session.paymentInstrument
      ? describeInstrument(order.paymentMethod, session.paymentInstrument)
      : undefined;

  // A paid order is ALREADY confirmed by the ERP. The success flow resets the
  // checkout session (clearing the payment instrument) before it navigates, so
  // a missing instrument must never surface the "Payment method needed" state
  // for a paid order — that was an incorrect intermediate error page shown for
  // the settle window right after a successful charge. Always render the success
  // confirmation here and let the redirect effect move to Order Confirmation.
  const isPaid = order?.payment?.status === "paid";
  const showSucceeded =
    isPaid || (paymentRun.state === "succeeded" && paymentRun.outcome?.status === "succeeded");
  const successOutcome: PaymentResult | null =
    paymentRun.outcome ??
    (isPaid && order
      ? ({
          status: "succeeded",
          method: order.paymentMethod,
          amount: order.grandTotal,
          transactionId: order.payment?.transactionId ?? "",
          paidAt: order.payment?.paidAt ?? order.placedAt,
        } satisfies PaymentSuccessResult)
      : null);

  const handleFinalize = useCallback(() => {
    if (
      !paymentRun.outcome ||
      paymentRun.outcome.status !== "succeeded" ||
      !order
    ) {
      return;
    }
    finalizedRef.current = true;
    const result = paymentRun.outcome;

    // Suppress auth clearing during backend confirmation so a 403 from the
    // ERP payment endpoint cannot destroy the session before the user sees
    // the confirmation screen.
    useAuthStore.getState().setSuppressPaymentAuthClear(true);
    finalize(order.id, {
      method: result.method,
      status: "paid",
      transactionId: result.transactionId,
      paidAt: result.paidAt,
      instrumentSummary,
    }).then((confirmed) => {
      if (!confirmed.ok) {
        setFinalizeError(
          confirmed.reason ??
            "Payment succeeded but your order could not be finalized. Contact support.",
        );
        finalizedRef.current = false;
      }
    }).finally(() => {
      useAuthStore.getState().setSuppressPaymentAuthClear(false);
    });
  }, [paymentRun.outcome, order, finalize, instrumentSummary]);

  useEffect(() => {
    if (paymentRun.state === "succeeded") {
      const timer = setTimeout(handleFinalize, 1400);
      return () => clearTimeout(timer);
    }
  }, [paymentRun.state, handleFinalize]);

  if (isLoading) {
    return (
      <div className="bg-surface-50 pb-12">
        <Container>
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Checkout", path: "/checkout" },
              { label: "Payment" },
            ]}
          />
          <Loading message="Preparing the secure payment gateway..." />
        </Container>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-surface-50 pb-12">
        <Container>
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Checkout", path: "/checkout" },
              { label: "Payment" },
            ]}
          />
          <div className="flex min-h-[45vh] flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={44} className="text-surface-300" />
            <h1 className="mt-4 text-xl font-bold text-surface-900">Payment session not found</h1>
            <p className="mt-2 max-w-sm text-sm text-surface-500">
              We couldn't find this order to process its payment. Return to checkout to start over.
            </p>
            <Link
              to="/checkout"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <ArrowLeft size={16} />
              Back to Checkout
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (finalizeError) {
    return (
      <div className="min-h-[70vh] bg-surface-50 pb-12">
        <Container>
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Checkout", path: "/checkout" },
              { label: "Payment" },
            ]}
          />

          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-surface-200 bg-surface-0 p-8 text-center">
            <AlertCircle size={40} className="mx-auto text-danger-500" />
            <h1 className="mt-4 text-lg font-bold text-surface-900">
              Payment could not be confirmed
            </h1>
            <p className="mt-2 text-sm text-surface-500">{finalizeError}</p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  setFinalizeError(null);
                  finalizedRef.current = false;
                  handleFinalize();
                }}
              >
                Try Confirming Again
              </Button>
              <Button variant="secondary" onClick={() => navigate("/orders")}>
                Go to My Orders
              </Button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-surface-400">
              Your payment was recorded — if this keeps happening, contact support.
              You will not be charged twice.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Checkout", path: "/checkout" },
            { label: "Payment" },
          ]}
        />

        <div className="mt-8">
          {showSucceeded ? (
            <PaymentProcessingScreen
              state="succeeded"
              stages={stages}
              currentStage={paymentRun.currentStage}
              completedStageIds={paymentRun.completedStageIds}
              outcome={successOutcome}
              orderId={order.id}
              amount={order.grandTotal}
              method={order.paymentMethod}
              isRetrying={false}
              onRetry={() => {}}
              onChangeMethod={() => {}}
            />
          ) : !instrumentValid ? (
            <div className="mx-auto max-w-md rounded-2xl border border-surface-200 bg-surface-0 p-8 text-center">
              <AlertCircle size={40} className="mx-auto text-warning-500" />
              <h1 className="mt-4 text-lg font-bold text-surface-900">Payment method needed</h1>
              <p className="mt-2 text-sm text-surface-500">
                Please choose a payment method and try again.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                <Button onClick={() => navigate("/checkout?step=payment")}>
                  Select Payment Method
                </Button>
                <Button variant="secondary" onClick={() => navigate("/checkout")}>
                  <ArrowLeft size={14} className="mr-2" />
                  Back to Checkout
                </Button>
              </div>
            </div>
          ) : (
            <PaymentProcessingScreen
              state={screenState}
              stages={stages}
              currentStage={paymentRun.currentStage}
              completedStageIds={paymentRun.completedStageIds}
              outcome={paymentRun.outcome}
              orderId={order.id}
              amount={order.grandTotal}
              method={order.paymentMethod}
              isRetrying={paymentRun.state === "processing"}
              onRetry={() => {
                if (!session.paymentInstrument || !isPaymentInstrumentValid(order.paymentMethod, session.paymentInstrument)) return;
                paymentRun.run({
                  orderId: order.id,
                  method: order.paymentMethod,
                  instrument: session.paymentInstrument,
                  amount: order.grandTotal,
                  idempotencyKey: attempt?.id,
                });
              }}
              onChangeMethod={() => navigate("/checkout?step=payment")}
              onCancel={() => {
                paymentRun.cancel();
                setPaymentAttempt(null);
                addToast("Payment cancelled. Your cart is safe.", "info");
                navigate("/checkout?step=payment");
              }}
            />
          )}
        </div>
      </Container>
    </div>
  );
}

export type { PaymentScreenState };