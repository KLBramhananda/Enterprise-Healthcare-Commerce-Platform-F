/**
 * PaymentProcessingScreen
 *
 * Full-screen mock payment gateway UX: animated stage list, progress bar,
 * success confirmation, and failure state with retry / change-method.
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  CreditCard,
  Loader2,
  Lock,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatters";
import { PAYMENT_METHOD_LABELS } from "@/config/checkout";
import type {
  PaymentFailureResult,
  PaymentResult,
  PaymentStage,
  PaymentStageId,
} from "@/types/checkout";

export type PaymentScreenState = "processing" | "succeeded" | "failed";

interface PaymentProcessingScreenProps {
  state: PaymentScreenState;
  stages: PaymentStage[];
  currentStage: PaymentStage | null;
  completedStageIds: PaymentStageId[];
  outcome: PaymentResult | null;
  orderId: string;
  amount: number;
  method: string;
  isRetrying: boolean;
  onRetry: () => void;
  onChangeMethod: () => void;
}

export default function PaymentProcessingScreen({
  state,
  stages,
  currentStage,
  completedStageIds,
  outcome,
  orderId,
  amount,
  method,
  isRetrying,
  onRetry,
  onChangeMethod,
}: PaymentProcessingScreenProps) {
  const progress = stages.length > 0 ? Math.round((completedStageIds.length / stages.length) * 100) : 0;
  const failure = outcome?.status === "failed" ? (outcome as PaymentFailureResult) : null;

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-surface-0 shadow-sm">
        {/* Header */}
        <div className="border-b border-surface-100 bg-surface-50/60 px-6 py-5 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <Lock size={12} />
            Secure Payment
          </div>
          <h1 className="mt-3 text-lg font-bold text-surface-900">Processing Your Payment</h1>
          <p className="mt-1 text-sm text-surface-500">
            Order <span className="font-semibold text-surface-700">{orderId}</span> &middot;{" "}
            {PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] ?? method}
          </p>
          <p className="mt-2 text-2xl font-bold text-brand-700">{formatCurrency(amount)}</p>
        </div>

        <div className="px-6 py-6">
          <AnimatePresence mode="wait">
            {state === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-live="polite"
                aria-atomic
              >
                <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-surface-100">
                  <motion.div
                    className="h-full rounded-full bg-brand-600"
                    initial={false}
                    animate={{ width: `${Math.max(progress, 8)}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>

                <ul className="space-y-3" aria-label="Payment progress">
                  {stages.map((stage) => {
                    const isCompleted = completedStageIds.includes(stage.id);
                    const isCurrent = currentStage?.id === stage.id;
                    return (
                      <li
                        key={stage.id}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                          isCurrent
                            ? "border-brand-200 bg-brand-50/60"
                            : isCompleted
                              ? "border-surface-100 bg-surface-0"
                              : "border-surface-100 bg-surface-0 opacity-60",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                            isCompleted && "bg-brand-600 text-white",
                            isCurrent && "bg-brand-600 text-white",
                            !isCompleted && !isCurrent && "bg-surface-100 text-surface-400",
                          )}
                        >
                          {isCurrent ? (
                            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                          ) : isCompleted ? (
                            <Check size={14} aria-hidden="true" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-current" />
                          )}
                        </span>
                        <div>
                          <p
                            className={cn(
                              "text-sm font-medium",
                              isCurrent ? "text-brand-800" : isCompleted ? "text-surface-900" : "text-surface-500",
                            )}
                          >
                            {stage.label}
                          </p>
                          <p className="text-xs text-surface-500">{stage.description}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-surface-400">
                  <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                  Please do not close or refresh this page.
                </p>
              </motion.div>
            )}

            {state === "succeeded" && outcome && outcome.status === "succeeded" && (
              <motion.div
                key="succeeded"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 text-center"
                aria-live="assertive"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50"
                >
                  <Check size={32} className="text-success-600" />
                </motion.div>
                <h2 className="mt-4 text-xl font-bold text-surface-900">Payment Successful!</h2>
                <p className="mt-1 text-sm text-surface-500">
                  {formatCurrency(outcome.amount)} paid via{" "}
                  {PAYMENT_METHOD_LABELS[outcome.method as keyof typeof PAYMENT_METHOD_LABELS] ?? outcome.method}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-50 px-3 py-1.5 text-xs text-surface-500">
                  <CreditCard size={12} />
                  Txn ID: <span className="font-medium text-surface-700">{outcome.status === "succeeded" ? outcome.transactionId : ""}</span>
                </p>
                <p className="mt-4 text-xs text-surface-400">
                  Redirecting to your order confirmation...
                </p>
              </motion.div>
            )}

            {state === "failed" && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-2 text-center"
                aria-live="assertive"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-50"
                >
                  <XCircle size={32} className="text-danger-500" />
                </motion.div>

                <h2 className="mt-4 text-xl font-bold text-surface-900">Payment Failed</h2>
                <p className="mx-auto mt-1 max-w-sm text-sm text-surface-500">
                  {failure?.message ?? "Your payment could not be completed. Please try again."}
                </p>

                {failure && (
                  <div className="mx-auto mt-4 max-w-xs space-y-1.5 rounded-xl border border-danger-100 bg-danger-50/60 p-3 text-xs text-danger-700">
                    <p className="flex justify-between">
                      <span>Amount</span>
                      <span className="font-semibold">{formatCurrency(amount)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Failed at</span>
                      <span className="font-semibold capitalize">
                        {stages.find((s) => s.id === failure.stage)?.label ?? failure.stage}
                      </span>
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button onClick={onRetry} loading={isRetrying} className="flex-1 sm:flex-none">
                    <RefreshCw size={14} className="mr-2" />
                    Try Again
                  </Button>
                  <Button variant="secondary" onClick={onChangeMethod} disabled={isRetrying} className="flex-1 sm:flex-none">
                    Change Payment Method
                  </Button>
                </div>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-surface-400">
                  <AlertCircle size={12} />
                  Your order and cart are safe — nothing has been charged.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}