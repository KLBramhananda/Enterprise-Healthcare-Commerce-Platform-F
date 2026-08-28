/**
 * PaymentProcessingPage
 *
 * Rendered at /checkout/payment/:orderId after the wizard creates an order
 * for an online payment method. Runs the mock gateway (stages at
 * PaymentProcessingScreen), confirms the order on success, and shows retry
 * or change-method actions on failure. The cart is only cleared on success.
 */

import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Container, Button, Loading } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { services } from "@/services/factory";
import { useCheckoutStore } from "@/store/checkoutStore";
import {
  usePaymentRun,
  usePaymentStages,
  useFinalizePayment,
} from "@/hooks/checkout/usePayment";
import { PaymentProcessingScreen } from "@/components/checkout";
import { describeInstrument, isPaymentInstrumentValid } from "@/utils/payment";
import { useToast } from "@/providers/ToastProvider";
import type { PaymentScreenState } from "@/components/checkout";

const checkoutService = services.checkout;

export default function PaymentProcessingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  usePageTitle("Processing Payment");
  const navigate = useNavigate();
  const { addToast } = useToast();

  const session = useCheckoutStore((s) => s.session);
  const { data: stages = [] } = usePaymentStages();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => checkoutService.getOrder(orderId as string),
    enabled: Boolean(orderId),
  });

  const paymentRun = usePaymentRun();
  const finalize = useFinalizePayment(navigate);
  const autoStartedRef = useRef(false);
  const finalizedRef = useRef(false);

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

    if (!isPaymentInstrumentValid(order.paymentMethod, session.paymentInstrument)) {
      return;
    }

    if (autoStartedRef.current) return;
    autoStartedRef.current = true;

    paymentRun.run({
      orderId: order.id,
      method: order.paymentMethod,
      instrument: session.paymentInstrument!,
      amount: order.grandTotal,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderId]);

  const screenState: PaymentScreenState =
    paymentRun.state === "idle" ? "processing" : paymentRun.state;

  const instrumentValid = order
    ? isPaymentInstrumentValid(order.paymentMethod, session.paymentInstrument)
    : false;
  const instrumentSummary =
    instrumentValid && order && session.paymentInstrument
      ? describeInstrument(order.paymentMethod, session.paymentInstrument)
      : undefined;

  useEffect(() => {
    if (
      paymentRun.state === "succeeded" &&
      paymentRun.outcome &&
      paymentRun.outcome.status === "succeeded" &&
      order &&
      !finalizedRef.current
    ) {
      finalizedRef.current = true;
      const result = paymentRun.outcome;
      const timer = setTimeout(() => {
        finalize(order.id, {
          method: result.method,
          status: "paid",
          transactionId: result.transactionId,
          paidAt: result.paidAt,
          instrumentSummary,
        }).then((confirmed) => {
          if (!confirmed.ok) {
            addToast("Payment succeeded but your order could not be finalized. Contact support.", "error");
            finalizedRef.current = false;
          }
        });
      }, 1400);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentRun.state, paymentRun.outcome, order]);

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
          {!instrumentValid ? (
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
                });
              }}
              onChangeMethod={() => navigate("/checkout?step=payment")}
            />
          )}
        </div>
      </Container>
    </div>
  );
}

export type { PaymentScreenState };