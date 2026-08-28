/**
 * Mock Address Service
 *
 * In-memory mock implementation of IAddressService.
 * Pre-seeded with 2 sample addresses.
 */

import type { Address, AddressFormData } from "@/types/checkout";
import type { IAddressService } from "./addressService";

let nextId = 3;

const addresses: Map<string, Address> = new Map([
  [
    "addr-001",
    {
      id: "addr-001",
      label: "Home",
      fullName: "Rahul Sharma",
      phone: "9876543210",
      line1: "42, Sunshine Apartments",
      line2: "MG Road, Near City Hospital",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
      isDefault: true,
    },
  ],
  [
    "addr-002",
    {
      id: "addr-002",
      label: "Office",
      fullName: "Rahul Sharma",
      phone: "9876543210",
      line1: "Floor 5, Tech Park",
      line2: "Sector 21, Cyber City",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122002",
      country: "India",
      isDefault: false,
    },
  ],
]);

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAddressService implements IAddressService {
  async getAddresses(): Promise<Address[]> {
    await delay();
    return Array.from(addresses.values()).sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });
  }

  async getAddress(id: string): Promise<Address | null> {
    await delay();
    return addresses.get(id) ?? null;
  }

  async addAddress(data: AddressFormData): Promise<Address> {
    await delay();
    const id = `addr-${String(nextId++).padStart(3, "0")}`;
    const address: Address = { ...data, id, isDefault: addresses.size === 0 };
    if (address.isDefault) {
      for (const existing of addresses.values()) {
        existing.isDefault = false;
      }
    }
    addresses.set(id, address);
    return address;
  }

  async updateAddress(id: string, data: Partial<AddressFormData>): Promise<Address> {
    await delay();
    const existing = addresses.get(id);
    if (!existing) throw new Error("Address not found");
    const updated = { ...existing, ...data };
    addresses.set(id, updated);
    return updated;
  }

  async deleteAddress(id: string): Promise<void> {
    await delay();
    const wasDefault = addresses.get(id)?.isDefault;
    addresses.delete(id);
    if (wasDefault && addresses.size > 0) {
      const first = addresses.values().next().value;
      if (first) first.isDefault = true;
    }
  }

  async setDefaultAddress(id: string): Promise<void> {
    await delay();
    for (const addr of addresses.values()) {
      addr.isDefault = addr.id === id;
    }
  }
}
