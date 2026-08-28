/**
 * CheckoutPage
 *
 * Full checkout experience with address selection, prescription upload,
 * delivery options, promo code, payment method, order summary, and
 * order review. Two-column layout on desktop, single column on mobile.
 */

import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, EmptyState, Loading } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useCart } from "@/hooks/shopping";
import { useCheckoutSession } from "@/hooks/checkout/useCheckout";
import { useAddresses } from "@/hooks/checkout/useAddress";
import { formatCurrency } from "@/utils/formatters";
import {
  AddressSection,
  PrescriptionUpload,
  DeliveryOptions,
  PromoCodeInput,
  PaymentMethodSelector,
  OrderSummaryCard,
  OrderReview,
} from "@/components/checkout";
import { useToast } from "@/providers/ToastProvider";

export default function CheckoutPage() {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { items, totalItems } = useCart();
  const { isLoading: addressesLoading } = useAddresses();
  const {
    session,
    selectedAddress,
    hasPrescriptionItems,
    subtotal,
    savings,
    deliveryCharge,
    discount,
    tax,
    grandTotal,
    canPlaceOrder,
    setAddress,
    setDeliverySpeed,
    setDeliveryNote,
    setPaymentMethod,
    placeOrder,
    isPendingOrder,
  } = useCheckoutSession();
  const [isPlacing, setIsPlacing] = useState(false);

  const requiredProducts = items
    .filter((i) => i.product.requiresPrescription)
    .map((i) => ({ id: i.product.id, name: i.product.name }));

  const handlePlaceOrder = useCallback(async () => {
    setIsPlacing(true);
    try {
      const order = await placeOrder();
      if (order) {
        addToast(`Order ${order.id} placed successfully!`, "success");
        navigate(`/orders/${order.id}/confirmation`);
      } else {
        addToast("Please complete all required details before placing the order.", "error");
      }
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.";
      addToast(message, "error");
    } finally {
      setIsPlacing(false);
    }
  }, [placeOrder, addToast, navigate]);

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

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Categories", path: "/categories" },
            { label: "Checkout" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            Checkout
            <span className="ml-2 text-base font-normal text-surface-500">
              ({totalItems} item{totalItems !== 1 ? "s" : ""})
            </span>
          </h1>
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ── Main Content ── */}
          <div className="space-y-8">
            {/* Address */}
            <section className="rounded-xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
              <AddressSection
                selectedAddressId={session.addressId}
                onSelectAddress={setAddress}
              />
            </section>

            {/* Prescription Upload (conditional) */}
            {hasPrescriptionItems && requiredProducts.length > 0 && (
              <section className="rounded-xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
                <PrescriptionUpload requiredProducts={requiredProducts} />
              </section>
            )}

            {/* Delivery */}
            <section className="rounded-xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
              <DeliveryOptions
                selectedSpeed={session.deliverySpeed}
                deliveryNote={session.deliveryNote}
                onSelectSpeed={setDeliverySpeed}
                onSetDeliveryNote={setDeliveryNote}
              />
            </section>

            {/* Promo Code */}
            <section className="rounded-xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-surface-900">Promo Code</h2>
              <p className="mt-0.5 text-sm text-surface-500">
                Try <span className="font-medium text-surface-700">HEALTH20</span> for 20% off
              </p>
              <div className="mt-3">
                <PromoCodeInput />
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
              <PaymentMethodSelector
                selected={session.paymentMethod}
                onSelect={setPaymentMethod}
              />
            </section>

            {/* Order Review */}
            <section className="rounded-xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
              <OrderReview
                address={selectedAddress}
                deliverySpeed={session.deliverySpeed}
                paymentMethod={session.paymentMethod}
                prescriptionCount={session.prescriptionFiles.length}
                hasPrescriptionItems={hasPrescriptionItems}
                grandTotal={grandTotal}
                canPlaceOrder={canPlaceOrder}
                isPlacing={isPlacing || isPendingOrder}
                onPlaceOrder={handlePlaceOrder}
              />
            </section>
          </div>

          {/* ── Sidebar (Desktop) ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
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

        {/* ── Mobile Summary Bar ── */}
        <div className="fixed bottom-0 left-0 right-0 z-sticky border-t border-surface-200 bg-surface-0 p-4 shadow-lg lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-surface-500">Grand Total</p>
              <p className="text-lg font-bold text-brand-700">
                {formatCurrency(grandTotal)}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={!canPlaceOrder || isPlacing || isPendingOrder}
              className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-surface-300 disabled:text-surface-500"
            >
              {isPlacing || isPendingOrder ? "Placing..." : "Place Order"}
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
