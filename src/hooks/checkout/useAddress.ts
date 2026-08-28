/**
 * useAddress
 *
 * Hook for address CRUD operations.
 * Wraps the address service with React Query for caching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services/factory";
import type { AddressFormData } from "./schemas";

const addressService = services.address;
const ADDRESS_QUERY_KEY = ["addresses"];

export function useAddresses() {
  return useQuery({
    queryKey: ADDRESS_QUERY_KEY,
    queryFn: () => addressService.getAddresses(),
  });
}

export function useSelectedAddress(addressId: string | null) {
  const { data: addresses } = useAddresses();
  return addresses?.find((a) => a.id === addressId) ?? null;
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddressFormData) => addressService.addAddress(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddressFormData> }) =>
      addressService.updateAddress(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY }),
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY }),
  });
}
