/**
 * Address Service Interface
 *
 * Defines the contract for address CRUD operations.
 * UI depends ONLY on this interface — swap MockAddressService
 * with ErpNextAddressService for backend integration.
 */

import type { Address, AddressFormData } from "@/types/checkout";

export interface IAddressService {
  getAddresses(): Promise<Address[]>;
  getAddress(id: string): Promise<Address | null>;
  addAddress(data: AddressFormData): Promise<Address>;
  updateAddress(id: string, data: Partial<AddressFormData>): Promise<Address>;
  deleteAddress(id: string): Promise<void>;
  setDefaultAddress(id: string): Promise<void>;
}
