/**
 * useCheckout
 *
 * Hook that combines checkout store, cart store, and checkout service.
 * Provides validation, order summary, and place order action.
 *
 * Every total (subtotal, savings, delivery charge, offer discount, tax,
 * platform fee and grand total) is derived from the shared
 * computeCheckoutTotals source in both LIVE_API and STATIC mode, so the Order
 * Summary, the Review & Pay step, the payment screen, the placed order and the
 * invoice can never disagree about an amount:
 *
 *   Grand Total = Item Price + Delivery Charge - Offer Discount + GST/Tax + Platform Fee
 *
 * with GST/Tax kept at 0 for now. The selected delivery speed drives the
 * delivery charge and the applied offer is always deducted from the total.
 *
 * In LIVE_API mode the ERP address summary is still fetched and used to gate
 * order placement, and the order is placed via checkout.validate →
 * checkout.create_order (exactly once – the backend replays identical drafts).
 * The created order is added to the persisted checkout store so success/order
 * screens read the authoritative record.
 *
 * STATIC mode keeps the original local behavior unchanged.
 */

import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import type { CartItem } from "@/store/cartStore";
import { services } from "@/services/factory";
import { DATA_SOURCE } from "@/config/env";
import { DELIVERY_OPTIONS } from "@/config/checkout";
import { computeCheckoutTotals, type CheckoutTotals } from "@/utils/checkoutCalculations";
import { useAddresses } from "./useAddress";
import type {
  Address,
  AppliedPromo,
  CheckoutOrderResult,
  DeliverySpeed,
  Order,
  PaymentMethodType,
  PrescriptionFile,
} from "@/types/checkout";

const checkoutService = services.checkout;
const LIVE = DATA_SOURCE === "LIVE_API";

export const CHECKOUT_SUMMARY_QUERY_KEY = "checkout-summary";

export function useDeliveryOptions() {
  const { data: options, isLoading } = useQuery({
    queryKey: ["deliveryOptions"],
    queryFn: () => checkoutService.getDeliveryOptions(),
  });
  return { options: options ?? [], isLoading };
}

function getEstimatedDelivery(days: number): string {
  const now = new Date();
  if (days === 0) {
    return now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  const target = new Date(now);
  target.setDate(target.getDate() + days);
  return target.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildOrder(
  created: CheckoutOrderResult,
  params: {
    items: CartItem[];
    addressId: string;
    deliverySpeed: DeliverySpeed;
    deliveryNote: string;
    paymentMethod: PaymentMethodType;
    prescriptionFiles: PrescriptionFile[];
    savings: number;
    appliedPromo: AppliedPromo | null;
    shippingAddress: Address | null;
  },
  totals: CheckoutTotals,
): Order {
  const deliveryOption = DELIVERY_OPTIONS.find((o) => o.speed === params.deliverySpeed);
  return {
    id: created.salesOrder,
    invoiceId: "",
    trackingId: "",
    items: params.items.map((item) => ({ product: item.product, quantity: item.quantity })),
    address:
      params.shippingAddress ??
      ({
        id: params.addressId,
        label: "Shipping Address",
        fullName: "",
        phone: "",
        line1: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
        isDefault: false,
      } satisfies Address),
    deliverySpeed: params.deliverySpeed,
    deliveryNote: params.deliveryNote,
    prescriptionFiles: params.prescriptionFiles,
    appliedPromo: params.appliedPromo,
    subtotal: totals.subtotal,
    savings: params.savings,
    deliveryCharge: totals.deliveryCharge,
    discount: totals.discount,
    tax: totals.tax,
    platformFee: totals.platformFee,
    grandTotal: totals.grandTotal,
    paymentMethod: params.paymentMethod,
    payment: { method: params.paymentMethod, status: "pending" },
    status: "placed",
    placedAt: new Date().toISOString(),
    estimatedDelivery: getEstimatedDelivery(deliveryOption?.estimatedDays ?? 4),
  };
}

export function useCheckoutSession() {
  const session = useCheckoutStore((s) => s.session);
  const setAddress = useCheckoutStore((s) => s.setAddress);
  const setDeliverySpeed = useCheckoutStore((s) => s.setDeliverySpeed);
  const setDeliveryNote = useCheckoutStore((s) => s.setDeliveryNote);
  const setAppliedPromo = useCheckoutStore((s) => s.setAppliedPromo);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
  const setPaymentInstrument = useCheckoutStore((s) => s.setPaymentInstrument);
  const addPrescription = useCheckoutStore((s) => s.addPrescription);
  const removePrescription = useCheckoutStore((s) => s.removePrescription);
  const setPrescriptionUploadLater = useCheckoutStore((s) => s.setPrescriptionUploadLater);
  const addOrder = useCheckoutStore((s) => s.addOrder);
  const resetSession = useCheckoutStore((s) => s.resetSession);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: addresses } = useAddresses();

  const selectedAddress = addresses?.find((a) => a.id === session.addressId) ?? null;
  const hasPrescriptionItems = items.some((i) => i.product.requiresPrescription);

  // All totals derive from the shared computeCheckoutTotals source so the Order
  // Summary, Review & Pay step, payment screen, placed order and invoice can
  // never disagree about an amount:
  //   Grand Total = Item Price + Delivery Charge - Offer Discount + GST/Tax + Platform Fee
  // The selected delivery speed drives the delivery charge and the applied
  // offer is always deducted from the total, in both LIVE_API and STATIC mode.
  const totals = computeCheckoutTotals({
    items,
    appliedPromo: session.appliedPromo,
    deliverySpeed: session.deliverySpeed,
  });
  const {
    subtotal,
    savings,
    deliveryCharge,
    discount,
    tax,
    platformFee,
    grandTotal,
  } = totals;

  // Live summary query – keyed by the selected address, the cart contents AND
  // the delivery speed, so it re-runs whenever the address, the items, or the
  // speed change (the ERP backend prices by configured flat rates, keyed by
  // address; the key still ensures a fresh fetch on speed change).
  const cartSignature = items
    .map((item) => `${item.product.id}:${item.quantity}`)
    .join("|");
  const promoSignature = session.appliedPromo?.code ?? "none";
  const summaryEnabled =
    LIVE && isAuthenticated && session.addressId !== null && items.length > 0;
  const {
    data: liveSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: [
      CHECKOUT_SUMMARY_QUERY_KEY,
      session.addressId,
      cartSignature,
      promoSignature,
      session.deliverySpeed,
    ],
    queryFn: () =>
      checkoutService.getCheckoutSummary(session.addressId ?? undefined, undefined),
    enabled: summaryEnabled,
  });

  const summary = LIVE ? liveSummary ?? null : null;

  const canPlaceOrder =
    items.length > 0 &&
    session.addressId !== null &&
    session.paymentMethod !== null &&
    (summaryEnabled ? summary !== null : true) &&
    (!hasPrescriptionItems ||
      session.prescriptionFiles.length > 0 ||
      session.prescriptionUploadLater);

  // In-flight lock so double clicks (before React re-renders) cannot submit
  // twice. The rendered button is also disabled while `isPendingOrder`.
  const isPlacingRef = useRef(false);
  const [isPendingOrder, setIsPendingOrder] = useState(false);

  /**
   * Creates the order record WITHOUT clearing the cart. Payment happens next:
   *  - COD:  finalized immediately (see finalizeCodOrder).
   *  - Online: cart persists until the gateway succeeds, so a failed payment
   *    can be retried or re-routed without losing the cart.
   *
   * LIVE_API places the order through checkout.validate → checkout.create_order
   * (exactly once; the backend replays identical drafts) and persists the
   * authoritative order in the checkout store immediately.
   */
  const createOrder = useCallback(async (): Promise<Order | null> => {
    if (isPlacingRef.current || !canPlaceOrder || !session.addressId || !session.paymentMethod) {
      return null;
    }
    isPlacingRef.current = true;
    setIsPendingOrder(true);
    try {
      if (!LIVE) {
        const order = await checkoutService.placeOrder({
          items,
          addressId: session.addressId,
          deliverySpeed: session.deliverySpeed,
          deliveryNote: session.deliveryNote,
          prescriptionFileIds: session.prescriptionFiles.map((f) => f.id),
          appliedPromo: session.appliedPromo,
          paymentMethod: session.paymentMethod,
        });
        const address = addresses?.find((a) => a.id === session.addressId);
        if (address) order.address = address;
        return order;
      }

      const validated = await checkoutService.validateCheckout(session.addressId);
      const created = await checkoutService.createCheckoutOrder({
        summary: validated,
        addressId: session.addressId,
        deliverySpeed: session.deliverySpeed,
        deliveryNote: session.deliveryNote,
        paymentMethod: session.paymentMethod,
        appliedPromo: session.appliedPromo,
      });
      const order = buildOrder(
        created,
        {
          items,
          addressId: session.addressId,
          deliverySpeed: session.deliverySpeed,
          deliveryNote: session.deliveryNote,
          paymentMethod: session.paymentMethod,
          prescriptionFiles: session.prescriptionFiles,
          savings,
          appliedPromo: session.appliedPromo,
          shippingAddress: validated.shippingAddress ?? selectedAddress,
        },
        totals,
      );
      addOrder(order);
      return order;
    } finally {
      isPlacingRef.current = false;
      setIsPendingOrder(false);
    }
  }, [canPlaceOrder, session, items, addresses, selectedAddress, savings, totals, addOrder]);

  /** Accepts an order on the customer side (COD): confirm + persist + clear. */
  const finalizeCodOrder = useCallback(
    async (order: Order): Promise<Order | null> => {
      try {
        let updated: Order;
        if (LIVE) {
          updated = {
            ...order,
            payment: {
              ...order.payment,
              method: order.paymentMethod,
              status: "pending",
              instrumentSummary: "Cash on Delivery",
            },
          };
        } else {
          updated = await checkoutService.confirmPayment(order.id, {
            method: order.paymentMethod,
            status: "pending",
            instrumentSummary: "Cash on Delivery",
          });
        }
        addOrder(updated);
        clearCart().catch(() => undefined);
        resetSession();
        return updated;
      } catch {
        return null;
      }
    },
    [addOrder, clearCart, resetSession],
  );

  return {
    session,
    selectedAddress,
    items,
    hasPrescriptionItems,
    subtotal,
    savings,
    deliveryCharge,
    discount,
    tax,
    platformFee,
    grandTotal,
    canPlaceOrder,
    isPendingOrder,
    isSummaryLoading,
    summaryError: LIVE ? summaryError : null,
    setAddress,
    setDeliverySpeed,
    setDeliveryNote,
    setAppliedPromo,
    setPaymentMethod,
    setPaymentInstrument,
    addPrescription,
    removePrescription,
    setPrescriptionUploadLater,
    createOrder,
    finalizeCodOrder,
  };
}

export function useValidatePromo() {
  const setAppliedPromo = useCheckoutStore((s) => s.setAppliedPromo);
  const subtotal = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  );

  const validate = useCallback(
    async (code: string): Promise<AppliedPromo | null> => {
      const result = await checkoutService.validatePromoCode(code, subtotal);
      if (result) setAppliedPromo(result);
      return result;
    },
    [subtotal, setAppliedPromo],
  );

  return { validate };
}