/**
 * useCheckout
 *
 * Hook that combines checkout store, cart store, and checkout service.
 * Provides validation, order summary, and place order action.
 *
 * LIVE_API mode: every total (subtotal, discount, tax, shipping charge, grand
 * total) comes from the ERP checkout.summary response for the selected
 * address. Placing an order re-validates via checkout.validate and then
 * creates the Draft Sales Order via checkout.create_order (exactly once – the
 * backend replays identical drafts, so retries don't duplicate). The created
 * order is added to the persisted checkout store so success/order screens
 * read the authoritative record.
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
import { DELIVERY_OPTIONS, isFreeDeliveryEligible } from "@/config/checkout";
import { useAddresses } from "./useAddress";
import type {
  Address,
  AppliedPromo,
  CheckoutOrderResult,
  CheckoutSummary,
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
  summary: CheckoutSummary,
  created: CheckoutOrderResult,
  params: {
    items: CartItem[];
    addressId: string;
    deliverySpeed: DeliverySpeed;
    deliveryNote: string;
    paymentMethod: PaymentMethodType;
    prescriptionFiles: PrescriptionFile[];
    savings: number;
    shippingAddress: Address | null;
  },
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
    subtotal: summary.subtotal,
    savings: params.savings,
    deliveryCharge: summary.shippingCharge,
    discount: summary.discount,
    tax: summary.tax,
    grandTotal: created.grandTotal,
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

  // Local math (STATIC mode / fallback while the live summary settles).
  const localSubtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const savings = items.reduce(
    (sum, i) => sum + (i.product.mrp - i.product.price) * i.quantity,
    0,
  );
  const localFreeDelivery = isFreeDeliveryEligible(session.appliedPromo, localSubtotal);
  const localDeliveryCharge = localFreeDelivery
    ? 0
    : DELIVERY_OPTIONS.find((o) => o.speed === session.deliverySpeed)?.charge ?? 0;
  const localDiscount = session.appliedPromo?.discountAmount ?? 0;
  const localTax = Math.round((localSubtotal - localDiscount) * 0.08 * 100) / 100;
  const localGrandTotal =
    Math.round((localSubtotal - localDiscount + localDeliveryCharge + localTax) * 100) / 100;

  // Live summary query – keyed by the selected address AND the cart contents
  // so it re-runs whenever the address or the items in the cart change.
  const cartSignature = items
    .map((item) => `${item.product.id}:${item.quantity}`)
    .join("|");
  const summaryEnabled =
    LIVE && isAuthenticated && session.addressId !== null && items.length > 0;
  const {
    data: liveSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: [CHECKOUT_SUMMARY_QUERY_KEY, session.addressId, cartSignature],
    queryFn: () =>
      checkoutService.getCheckoutSummary(session.addressId ?? undefined, undefined),
    enabled: summaryEnabled,
  });

  const summary = LIVE ? liveSummary ?? null : null;

  // Authoritative totals: ERP summary when available, local fallback otherwise.
  const subtotal = summary?.subtotal ?? localSubtotal;
  const deliveryCharge = summary?.shippingCharge ?? localDeliveryCharge;
  const discount = summary?.discount ?? localDiscount;
  const tax = summary?.tax ?? localTax;
  const grandTotal = summary?.grandTotal ?? localGrandTotal;

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
      });
      const order = buildOrder(validated, created, {
        items,
        addressId: session.addressId,
        deliverySpeed: session.deliverySpeed,
        deliveryNote: session.deliveryNote,
        paymentMethod: session.paymentMethod,
        prescriptionFiles: session.prescriptionFiles,
        savings,
        shippingAddress: validated.shippingAddress ?? selectedAddress,
      });
      addOrder(order);
      return order;
    } finally {
      isPlacingRef.current = false;
      setIsPendingOrder(false);
    }
  }, [canPlaceOrder, session, items, addresses, selectedAddress, savings, addOrder]);

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

export function useOrderHistory() {
  const orders = useCheckoutStore((s) => s.orders);
  return {
    data: [...orders].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    ),
    isLoading: false,
    isError: false,
    refetch: () => Promise.resolve(),
  };
}