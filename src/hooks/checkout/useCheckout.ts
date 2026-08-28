/**
 * useCheckout
 *
 * Hook that combines checkout store, cart store, and checkout service.
 * Provides validation, order summary, and place order action.
 */

import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { services } from "@/services/factory";
import { DELIVERY_OPTIONS } from "@/config/checkout";
import { useAddresses } from "./useAddress";
import type { AppliedPromo } from "@/types/checkout";

const checkoutService = services.checkout;

export function useDeliveryOptions() {
  const { data: options, isLoading } = useQuery({
    queryKey: ["deliveryOptions"],
    queryFn: () => checkoutService.getDeliveryOptions(),
  });
  return { options: options ?? [], isLoading };
}

export function useCheckoutSession() {
  const session = useCheckoutStore((s) => s.session);
  const setAddress = useCheckoutStore((s) => s.setAddress);
  const setDeliverySpeed = useCheckoutStore((s) => s.setDeliverySpeed);
  const setDeliveryNote = useCheckoutStore((s) => s.setDeliveryNote);
  const setAppliedPromo = useCheckoutStore((s) => s.setAppliedPromo);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
  const addPrescription = useCheckoutStore((s) => s.addPrescription);
  const removePrescription = useCheckoutStore((s) => s.removePrescription);
  const addOrder = useCheckoutStore((s) => s.addOrder);
  const resetSession = useCheckoutStore((s) => s.resetSession);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const { data: addresses } = useAddresses();

  const selectedAddress = addresses?.find((a) => a.id === session.addressId) ?? null;
  const hasPrescriptionItems = items.some((i) => i.product.requiresPrescription);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const savings = items.reduce((sum, i) => sum + (i.product.mrp - i.product.price) * i.quantity, 0);
  const deliveryCharge =
    DELIVERY_OPTIONS.find((o) => o.speed === session.deliverySpeed)?.charge ?? 0;
  const discount = session.appliedPromo?.discountAmount ?? 0;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const grandTotal = Math.round((subtotal - discount + deliveryCharge + tax) * 100) / 100;

  const canPlaceOrder =
    items.length > 0 &&
    session.addressId !== null &&
    session.paymentMethod !== null &&
    (!hasPrescriptionItems || session.prescriptionFiles.length > 0);

  // In-flight lock so double clicks (before React re-renders) cannot submit
  // twice. The rendered button is also disabled while `isPendingOrder`.
  const isPlacingRef = useRef(false);
  const [isPendingOrder, setIsPendingOrder] = useState(false);

  const placeOrder = useCallback(async () => {
    if (isPlacingRef.current || !canPlaceOrder || !session.addressId || !session.paymentMethod) {
      return null;
    }
    isPlacingRef.current = true;
    setIsPendingOrder(true);
    try {
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
      addOrder(order);
      clearCart();
      resetSession();
      return order;
    } finally {
      isPlacingRef.current = false;
      setIsPendingOrder(false);
    }
  }, [canPlaceOrder, session, items, addresses, addOrder, clearCart, resetSession]);

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
    setAddress,
    setDeliverySpeed,
    setDeliveryNote,
    setAppliedPromo,
    setPaymentMethod,
    addPrescription,
    removePrescription,
    placeOrder,
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
