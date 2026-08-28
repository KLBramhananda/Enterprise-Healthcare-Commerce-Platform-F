/**
 * Checkout Store
 *
 * Zustand store for checkout session state with localStorage persistence.
 * Manages address selection, delivery options, prescription files,
 * promo codes, payment method, and order history.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CheckoutSession,
  DeliverySpeed,
  PaymentMethodType,
  PaymentInstrument,
  PrescriptionFile,
  AppliedPromo,
  Order,
} from "@/types/checkout";

interface CheckoutState {
  session: CheckoutSession;
  orders: Order[];

  setAddress: (addressId: string) => void;
  setDeliverySpeed: (speed: DeliverySpeed) => void;
  setDeliveryNote: (note: string) => void;
  addPrescription: (file: PrescriptionFile) => void;
  removePrescription: (fileId: string) => void;
  setPrescriptionUploadLater: (value: boolean) => void;
  setAppliedPromo: (promo: AppliedPromo | null) => void;
  setPaymentMethod: (method: PaymentMethodType) => void;
  setPaymentInstrument: (instrument: PaymentInstrument | null) => void;
  addOrder: (order: Order) => void;
  resetSession: () => void;
}

const INITIAL_SESSION: CheckoutSession = {
  addressId: null,
  deliverySpeed: "standard",
  deliveryNote: "",
  prescriptionFiles: [],
  prescriptionUploadLater: false,
  appliedPromo: null,
  paymentMethod: null,
  paymentInstrument: null,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      session: { ...INITIAL_SESSION },
      orders: [],

      setAddress: (addressId) =>
        set((state) => ({ session: { ...state.session, addressId } })),

      setDeliverySpeed: (deliverySpeed) =>
        set((state) => ({ session: { ...state.session, deliverySpeed } })),

      setDeliveryNote: (deliveryNote) =>
        set((state) => ({ session: { ...state.session, deliveryNote } })),

      addPrescription: (file) =>
        set((state) => ({
          session: {
            ...state.session,
            prescriptionFiles: [...state.session.prescriptionFiles, file],
          },
        })),

      removePrescription: (fileId) =>
        set((state) => ({
          session: {
            ...state.session,
            prescriptionFiles: state.session.prescriptionFiles.filter((f) => f.id !== fileId),
          },
        })),

      setPrescriptionUploadLater: (prescriptionUploadLater) =>
        set((state) => ({ session: { ...state.session, prescriptionUploadLater } })),

      setAppliedPromo: (appliedPromo) =>
        set((state) => ({ session: { ...state.session, appliedPromo } })),

      setPaymentMethod: (paymentMethod) =>
        set((state) => ({ session: { ...state.session, paymentMethod } })),

      setPaymentInstrument: (paymentInstrument) =>
        set((state) => ({ session: { ...state.session, paymentInstrument } })),

      addOrder: (order) =>
        set((state) => ({
          orders: [
            order,
            ...state.orders.filter((existing) => existing.id !== order.id),
          ],
        })),

      resetSession: () => set({ session: { ...INITIAL_SESSION } }),
    }),
    {
      name: "keemeds-checkout",
      partialize: (state) => ({ session: state.session, orders: state.orders }),
    },
  ),
);
