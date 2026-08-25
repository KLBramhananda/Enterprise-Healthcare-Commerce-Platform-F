/**
 * useCheckout
 *
 * Hook that combines checkout store, cart store, and checkout service.
 * Provides validation, order summary, and place order action.
 */

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { MockCheckoutService } from "@/services/checkoutMock";
import { useAddresses } from "./useAddress";
import type { AppliedPromo } from "@/types/checkout";

const checkoutService = new MockCheckoutService();

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
  const deliveryCharge = 0;
  const discount = session.appliedPromo?.discountAmount ?? 0;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const grandTotal = Math.round((subtotal - discount + deliveryCharge + tax) * 100) / 100;

  const canPlaceOrder =
    items.length > 0 &&
    session.addressId !== null &&
    session.paymentMethod !== null &&
    (!hasPrescriptionItems || session.prescriptionFiles.length > 0);

  const placeOrder = useCallback(async () => {
    if (!canPlaceOrder || !session.addressId || !session.paymentMethod) return null;
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
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => checkoutService.getOrders(),
  });
}
