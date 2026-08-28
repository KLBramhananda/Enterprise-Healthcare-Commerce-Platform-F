/**
 * Checkout Validation Schemas
 *
 * Zod schemas for address form and promo code.
 * Used with react-hook-form via @hookform/resolvers/zod.
 */

import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required (e.g. Home, Office)"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  line1: z.string().min(5, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z
    .string()
    .min(4, "Pincode must be at least 4 characters")
    .max(10, "Pincode must be at most 10 characters"),
  country: z.string().min(2, "Country is required"),
});

export const promoCodeSchema = z.object({
  code: z.string().min(1, "Enter a promo code"),
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type PromoCodeFormData = z.infer<typeof promoCodeSchema>;
