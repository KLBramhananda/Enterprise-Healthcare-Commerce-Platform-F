/**
 * AddressForm
 *
 * Add/edit address form using react-hook-form + Zod validation.
 * Reuses Input from the design system.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui";
import { addressSchema, type AddressFormData } from "@/hooks/checkout/schemas";
import type { Address } from "@/types/checkout";

interface AddressFormProps {
  address?: Address | null;
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AddressForm({ address, onSubmit, onCancel, isLoading }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          label: address.label,
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2 ?? "",
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        }
      : { country: "India" },
  });

  useEffect(() => {
    if (address) {
      reset({
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 ?? "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
      });
    }
  }, [address, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Label" placeholder="e.g. Home, Office" error={errors.label?.message} {...register("label")} />
        <Input label="Full Name" placeholder="Full name" error={errors.fullName?.message} {...register("fullName")} />
      </div>
      <Input label="Phone Number" placeholder="10-digit phone number" error={errors.phone?.message} {...register("phone")} />
      <Input label="Address Line 1" placeholder="House/Flat no., Street, Area" error={errors.line1?.message} {...register("line1")} />
      <Input label="Address Line 2 (Optional)" placeholder="Landmark, Colony, etc." error={errors.line2?.message} {...register("line2")} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" placeholder="City" error={errors.city?.message} {...register("city")} />
        <Input label="State" placeholder="State" error={errors.state?.message} {...register("state")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Pincode" placeholder="Pincode" error={errors.pincode?.message} {...register("pincode")} />
        <Input label="Country" placeholder="Country" error={errors.country?.message} {...register("country")} />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {address ? "Update Address" : "Save Address"}
        </Button>
      </div>
    </form>
  );
}
