/**
 * CheckoutPage
 *
 * Multi-step checkout wizard: Address → Delivery → Prescription (when
 * required) → Coupon → Payment → Review & Pay. Two-column layout on desktop
 * with a sticky order summary; single column with a fixed action bar on
 * mobile. Orders are created before payment; the cart is only cleared when
 * the payment succeeds (or COD is accepted).
 */

import { useCallback, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardCheck,
  CreditCard,
  FileText,
  Lock,
  MapPin,
  Tag,
  Truck,
  Clock,
} from "lucide-react";
import { Container, EmptyState, Loading, Button } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useCheckoutSession } from "@/hooks/checkout/useCheckout";
import { useAddresses } from "@/hooks/checkout/useAddress";
import { isPaymentInstrumentValid } from "@/utils/payment";
import { formatCurrency } from "@/utils/formatters";
import {
  AddressSection,
  PrescriptionUpload,
  DeliveryOptions,
  PromoCodeInput,
  OffersSection,
  PaymentMethodPage,
  OrderSummaryCard,
  OrderReview,
  CheckoutStepper,
  type CheckoutStepperStep,
} from "@/components/checkout";
import { useToast } from "@/providers/ToastProvider";

type WizardStepId =
  | "address"
  | "delivery"
  | "prescription"
  | "coupon"
  | "payment"
  | "review";

export default function CheckoutPage() {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const [agreementChecked, setAgreementChecked] = useState(false);
  const { isLoading: addressesLoading } = useAddresses();

  const {
    session,
    selectedAddress,
    items,
    hasPrescriptionItems,
    subtotal,
    savings,
    deliveryCharge,
    discount,
    tax,
    grandTotal,
    canPlaceOrder,
    isPendingOrder,
    setAddress,
    setDeliverySpeed,
    setDeliveryNote,
    setPaymentMethod,
    setPaymentInstrument,
    setPrescriptionUploadLater,
    createOrder,
    finalizeCodOrder,
  } = useCheckoutSession();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const requiredProducts = items
    .filter((i) => i.product.requiresPrescription)
    .map((i) => ({ id: i.product.id, name: i.product.name }));

  const steps: CheckoutStepperStep[] = [
    { id: "address", label: "Address", icon: MapPin },
    { id: "delivery", label: "Delivery", icon: Truck },
    ...(hasPrescriptionItems
      ? [{ id: "prescription" as WizardStepId, label: "Prescription", icon: FileText }]
      : []),
    { id: "coupon", label: "Coupon", icon: Tag },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "review", label: "Review & Pay", icon: ClipboardCheck },
  ];

  const isStepComplete = useCallback(
    (stepId: WizardStepId): boolean => {
      switch (stepId) {
        case "address":
          return session.addressId !== null;
        case "delivery":
          return true;
        case "prescription":
          return (
            !hasPrescriptionItems ||
            session.prescriptionFiles.length > 0 ||
            session.prescriptionUploadLater
          );
        case "coupon":
          return true;
        case "payment":
          return (
            session.paymentMethod !== null &&
            isPaymentInstrumentValid(session.paymentMethod, session.paymentInstrument)
          );
        case "review":
          return canPlaceOrder && agreementChecked;
        default:
          return false;
      }
    },
    [
      session.addressId,
      session.prescriptionFiles.length,
      session.prescriptionUploadLater,
      session.paymentMethod,
      session.paymentInstrument,
      hasPrescriptionItems,
      canPlaceOrder,
      agreementChecked,
    ],
  );

  const [currentStepId, setCurrentStepId] = useState<WizardStepId>(() => {
    const requested = searchParams.get("step");
    const found = steps.find((s) => s.id === requested);
    return found ? (found.id as WizardStepId) : (steps[0].id as WizardStepId);
  });

  const currentStepIndex = steps.findIndex((s) => s.id === currentStepId);
  const completedIds = steps
    .filter((s, i) => i < currentStepIndex && isStepComplete(s.id as WizardStepId))
    .map((s) => s.id);

  const goToStep = (id: string) => {
    const target = steps.find((s) => s.id === id);
    if (!target) return;
    const targetIndex = steps.indexOf(target);
    const isReachable =
      targetIndex <= currentStepIndex ||
      steps.every((s, i) => {
        if (i >= targetIndex) return true;
        return isStepComplete(s.id as WizardStepId);
      });
    if (!isReachable) {
      addToast("Please complete the earlier steps first.", "warning");
      return;
    }
    setCurrentStepId(id as WizardStepId);
  };

  const stepValidationMessage = (stepId: WizardStepId): string | null => {
    switch (stepId) {
      case "address":
        return session.addressId !== null ? null : "Please select a delivery address.";
      case "delivery":
        return null;
      case "prescription":
        if (!hasPrescriptionItems) return null;
        return session.prescriptionFiles.length > 0 || session.prescriptionUploadLater
          ? null
          : "Upload a prescription or choose 'I'll upload later' to continue.";
      case "coupon":
        return null;
      case "payment":
        if (session.paymentMethod === null) return "Please choose a payment method.";
        return isPaymentInstrumentValid(session.paymentMethod, session.paymentInstrument)
          ? null
          : "Please complete the payment details for the selected method.";
      case "review":
        if (!agreementChecked) return "Please confirm the order details first.";
        return canPlaceOrder ? null : "Complete the earlier steps to place your order.";
      default:
        return null;
    }
  };

  // Guards rapid double clicks on Continue while the step state settles.
  const advancingRef = useRef(false);

  const handleNext = () => {
    if (advancingRef.current) return;
    const message = stepValidationMessage(currentStepId);
    if (message) {
      addToast(message, "warning");
      return;
    }
    if (currentStepIndex + 1 >= steps.length) return;
    advancingRef.current = true;
    setCurrentStepId(steps[currentStepIndex + 1].id as WizardStepId);
    window.setTimeout(() => {
      advancingRef.current = false;
    }, 300);
  };

  const handleBack = () => {
    if (advancingRef.current) return;
    if (currentStepIndex === 0) return;
    advancingRef.current = true;
    setCurrentStepId(steps[currentStepIndex - 1].id as WizardStepId);
    window.setTimeout(() => {
      advancingRef.current = false;
    }, 300);
  };

  const handlePay = useCallback(async () => {
    if (!agreementChecked) {
      addToast("Please confirm the order details before placing your order.", "warning");
      return;
    }
    try {
      const order = await createOrder();
      if (!order) {
        addToast("Please complete all required details before paying.", "error");
        return;
      }
      if (order.paymentMethod === "cod") {
        const finalized = await finalizeCodOrder(order);
        if (!finalized) {
          addToast("We couldn't place your order. Please try again.", "error");
          return;
        }
        addToast(`Order ${finalized.id} placed successfully!`, "success");
        navigate(`/orders/${finalized.id}/confirmation`);
      } else {
        navigate(`/checkout/payment/${order.id}`);
      }
    } catch (err) {
      addToast(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.",
        "error",
      );
    }
  }, [agreementChecked, createOrder, finalizeCodOrder, addToast, navigate]);

  if (addressesLoading) {
    return (
      <Container className="py-16">
        <Loading message="Loading checkout..." />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Your cart is empty"
          description="Add some items to your cart before checking out."
          action={
            <Link
              to="/categories"
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Browse Products
            </Link>
          }
        />
      </Container>
    );
  }

  const isReviewStep = currentStepId === "review";
  const isCod = session.paymentMethod === "cod";

  const actionLabel = isReviewStep
    ? isPendingOrder
      ? "Processing..."
      : isCod
        ? "Place Order"
        : `Pay ${formatCurrency(grandTotal)}`
    : currentStepId === "coupon"
      ? "Apply & Continue"
      : "Continue";

  const reviewAction = (
    <Button
      size="lg"
      loading={isReviewStep && isPendingOrder}
      disabled={isReviewStep ? isPendingOrder || !canPlaceOrder : false}
      onClick={isReviewStep ? handlePay : handleNext}
      className="w-full lg:w-auto"
    >
      {!isPendingOrder && isReviewStep && !isCod && <Lock size={14} className="mr-2" />}
      {actionLabel}
    </Button>
  );

  const paymentAction = (
    <div className="flex w-full flex-wrap items-center justify-end gap-x-2.5 gap-y-1">
      <span className="text-xs font-medium text-surface-500 lg:text-sm">
        Payable{" "}
        <span className="font-semibold text-surface-900">{formatCurrency(grandTotal)}</span>
      </span>
      <Button size="lg" onClick={handleNext} className="w-full sm:w-auto">
        Continue to Review
        <ArrowRight size={16} className="ml-2" />
      </Button>
    </div>
  );

  const actionButton = isReviewStep
    ? reviewAction
    : currentStepId === "payment"
      ? paymentAction
      : (
          <Button size="lg" onClick={handleNext} className="w-full lg:w-auto">
            {actionLabel}
          </Button>
        );

  return (
    <div className="bg-surface-50 pb-24 lg:pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Categories", path: "/categories" },
            { label: "Checkout" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
              Checkout
              <span className="ml-2 text-base font-normal text-surface-500">
                ({totalItems} item{totalItems !== 1 ? "s" : ""})
              </span>
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-surface-500">
              <Clock size={14} />
              Step {currentStepIndex + 1} of {steps.length} · {steps[currentStepIndex]?.label}
            </p>
          </div>

          <div className="mt-4">
            <CheckoutStepper
              steps={steps}
              currentId={currentStepId}
              completedIds={completedIds}
              onStepClick={goToStep}
            />
          </div>
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ── Main Content ── */}
          <div className="space-y-6">
            <section className="rounded-xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentStepId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {currentStepId === "address" && (
                    <AddressSection selectedAddressId={session.addressId} onSelectAddress={setAddress} />
                  )}

                  {currentStepId === "delivery" && (
                    <DeliveryOptions
                      selectedSpeed={session.deliverySpeed}
                      deliveryNote={session.deliveryNote}
                      onSelectSpeed={setDeliverySpeed}
                      onSetDeliveryNote={setDeliveryNote}
                    />
                  )}

                  {currentStepId === "prescription" && (
                    <div>
                      <PrescriptionUpload requiredProducts={requiredProducts} />

                      <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-surface-200 bg-surface-50 p-4">
                        <input
                          type="checkbox"
                          checked={session.prescriptionUploadLater}
                          onChange={(e) => setPrescriptionUploadLater(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 border-surface-300 text-brand-600 focus:ring-brand-500/20"
                          aria-label="I'll upload my prescription later"
                        />
                        <div>
                          <span className="block text-sm font-medium text-surface-900">
                            I&apos;ll upload my prescription later
                          </span>
                          <span className="text-xs text-surface-500">
                            Our pharmacist will contact you to verify before dispatch.
                          </span>
                        </div>
                      </label>
                    </div>
                  )}

                  {currentStepId === "coupon" && (
                    <div>
                      <h2 className="text-base font-semibold text-surface-900">Promo Code</h2>
                      <p className="mt-0.5 text-sm text-surface-500">
                        Apply a promo code or pick one of the offers below. Coupons are optional.
                      </p>
                      <div className="mt-3">
                        <PromoCodeInput />
                      </div>
                      <OffersSection subtotal={subtotal} />
                    </div>
                  )}

                  {currentStepId === "payment" && (
                    <PaymentMethodPage
                      selectedMethod={session.paymentMethod}
                      instrument={session.paymentInstrument}
                      grandTotal={grandTotal}
                      onSelect={(method, instrument) => {
                        setPaymentMethod(method);
                        setPaymentInstrument(instrument);
                      }}
                    />
                  )}

                  {currentStepId === "review" && (
                    <OrderReview
                      address={selectedAddress}
                      deliverySpeed={session.deliverySpeed}
                      paymentMethod={session.paymentMethod}
                      instrument={session.paymentInstrument}
                      prescriptionCount={session.prescriptionFiles.length}
                      hasPrescriptionItems={hasPrescriptionItems}
                      prescriptionUploadLater={session.prescriptionUploadLater}
                      appliedPromo={session.appliedPromo}
                      subtotal={subtotal}
                      savings={savings}
                      deliveryCharge={deliveryCharge}
                      discount={discount}
                      tax={tax}
                      grandTotal={grandTotal}
                      onEdit={(target) => goToStep(target)}
                      agreementChecked={agreementChecked}
                      onAgreementChange={setAgreementChecked}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </section>

            {/* Desktop footer (hidden on mobile; the mobile action bar below is the only sticky action area) */}
            <div className="hidden items-center justify-between gap-3 lg:flex">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleBack}
                disabled={currentStepIndex === 0 || isPendingOrder}
              >
                Back
              </Button>
              {actionButton}
            </div>
          </div>

          {/* ── Sidebar (Desktop) ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <OrderSummaryCard
                items={items}
                subtotal={subtotal}
                savings={savings}
                deliveryCharge={deliveryCharge}
                discount={discount}
                tax={tax}
                grandTotal={grandTotal}
                appliedPromo={session.appliedPromo}
              />
            </div>
          </aside>
        </div>

        {/* ── Mobile Action Bar ── */}
        <div className="fixed bottom-0 left-0 right-0 z-sticky border-t border-surface-200 bg-surface-0 shadow-lg pb-safe lg:hidden">
          <div className="flex items-center gap-3 px-4 pt-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleBack}
              disabled={currentStepIndex === 0 || isPendingOrder}
            >
              Back
            </Button>
            <div className="flex-1">{actionButton}</div>
          </div>
        </div>
      </Container>
    </div>
  );
}