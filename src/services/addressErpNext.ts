/**
 * ERPNext Address Service (LIVE_API mode)
 *
 * Implements IAddressService backed entirely by the live KeeMeds Commerce
 * ERPNext customer address endpoints (keemeds_commerce.api.customer):
 *   - GET  list_addresses · GET get_address
 *   - POST create_address · POST update_address · POST delete_address
 *   - POST set_default_shipping   (the checkout/delivery default)
 *
 * Drop-in replacement for MockAddressService in the LIVE_API factory branch;
 * the UI (AddressesPage, AddressSection, hooks) depends only on IAddressService.
 *
 * DTO mapping notes:
 *   - `label` round-trips through the free-text `address_title` column so the
 *     form edit/prefill and the label tab filters (home / work / other) keep
 *     working exactly as in mock mode.
 *   - `address_type` is a required ERPNext Select; it is derived from the label
 *     (home/personal → "Personal", work/office → "Office", else "Other").
 *   - The ERPNext Address schema has NO recipient-name column, so `fullName`
 *     cannot be persisted. It is mapped back from `address_title` (the closest
 *     native field) to keep the address card / checkout recipient populated.
 *     Persisting a distinct recipient name requires a backend field (see report).
 *   - `isDefault` reflects the ERPNext "shipping address" flag (what checkout
 *     preselects). `setDefaultAddress` therefore calls set_default_shipping.
 */

import { apiClient } from "@/api/client";
import { ApiError, fromAxiosError } from "@/api/errors";
import { API_ROUTES } from "@/config/api";
import type { Address, AddressFormData } from "@/types/checkout";
import type {
  ErpAddressDTO,
  ErpAddressListMessage,
  ErpAddressMessage,
} from "@/types/erpnextAddress";
import type { IAddressService } from "./addressService";
import { ServiceError } from "./authService";

/** Timeout override preventing address requests from hanging. */
const ADDRESS_TIMEOUT = 30_000;

/**
 * Map a storefront label to a valid ERPNext `address_type`. The backend
 * validator (`customer_params.validate_address_args`) requires the type to be
 * one of the allowed Address doctype select options.
 */
function toAddressType(label: string): string {
  const normalized = (label ?? "").trim().toLowerCase();
  if (normalized.includes("home") || normalized.includes("personal")) return "Personal";
  if (normalized.includes("work") || normalized.includes("office")) return "Office";
  return "Other";
}

/** Map an ErpAddressDTO to the storefront Address domain type. */
function toAddress(dto: ErpAddressDTO): Address {
  const title = (dto.address_title ?? "").trim();
  const fallback = dto.address_type || "Other";
  return {
    id: dto.name,
    label: title || fallback,
    fullName: title || fallback,
    phone: dto.phone || "",
    line1: dto.address_line1,
    line2: dto.address_line2 || undefined,
    city: dto.city,
    state: dto.state || "",
    pincode: dto.pincode || "",
    country: dto.country,
    isDefault: Boolean(dto.is_shipping_address || dto.is_primary_address),
  };
}

/** Build the create/update payload accepted by customer_params validators. */
function toPayload(data: AddressFormData) {
  return {
    address_title: data.label,
    address_type: toAddressType(data.label),
    address_line1: data.line1,
    address_line2: data.line2 ?? "",
    city: data.city,
    state: data.state,
    country: data.country,
    pincode: data.pincode,
    phone: data.phone,
  };
}

/** Normalize request failures into ServiceError instances. */
function normalizeError(error: unknown, fallback: string): never {
  if (error instanceof ServiceError) throw error;
  const apiErr = error instanceof ApiError ? error : fromAxiosError(error);
  const status = apiErr.status;

  if (status === 401 || status === 403) {
    throw new ServiceError(
      "Your session has expired. Please sign in again.",
      "SESSION_EXPIRED",
      status,
    );
  }
  // Frappe surfaces field validation failures as 417/422.
  if (status === 417 || status === 422 || apiErr.category === "validationError") {
    throw new ServiceError(apiErr.message || fallback, "VALIDATION_ERROR", status);
  }
  throw new ServiceError(apiErr.message || fallback, "ADDRESS_ERROR", status);
}

export class ErpNextAddressService implements IAddressService {
  readonly name = "ErpNextAddressService";

  async getAddresses(): Promise<Address[]> {
    try {
      const response = await apiClient.get<{ message: ErpAddressListMessage }>(
        API_ROUTES.ADDRESSES.LIST,
        { timeout: ADDRESS_TIMEOUT },
      );
      const message = response.data?.message;
      if (!message?.data) {
        throw new ApiError({ message: "Invalid response from address API", category: "unknown" });
      }
      const dtoAddresses = Array.isArray(message.data.addresses) ? message.data.addresses : [];
      return dtoAddresses.map(toAddress);
    } catch (error: unknown) {
      throw normalizeError(error, "Could not load your addresses. Please try again.");
    }
  }

  async getAddress(id: string): Promise<Address | null> {
    try {
      const response = await apiClient.get<{ message: ErpAddressMessage }>(
        API_ROUTES.ADDRESSES.GET,
        { params: { address_name: id }, timeout: ADDRESS_TIMEOUT },
      );
      const message = response.data?.message;
      if (!message?.data) return null;
      return toAddress(message.data);
    } catch (error: unknown) {
      const apiErr = error instanceof ApiError ? error : fromAxiosError(error);
      if (apiErr.status === 404) return null;
      throw normalizeError(error, "Could not load the address. Please try again.");
    }
  }

  async addAddress(data: AddressFormData): Promise<Address> {
    try {
      const response = await apiClient.post<{ message: ErpAddressMessage }>(
        API_ROUTES.ADDRESSES.CREATE,
        toPayload(data),
        { timeout: ADDRESS_TIMEOUT },
      );
      const message = response.data?.message;
      if (!message?.data) {
        throw new ApiError({ message: "Invalid response from address API", category: "unknown" });
      }
      return toAddress(message.data);
    } catch (error: unknown) {
      throw normalizeError(error, "Something went wrong while saving the address. Please try again.");
    }
  }

  async updateAddress(id: string, data: Partial<AddressFormData>): Promise<Address> {
    try {
      const response = await apiClient.post<{ message: ErpAddressMessage }>(
        API_ROUTES.ADDRESSES.UPDATE,
        { address_name: id, ...toPayload(data as AddressFormData) },
        { timeout: ADDRESS_TIMEOUT },
      );
      const message = response.data?.message;
      if (!message?.data) {
        throw new ApiError({ message: "Invalid response from address API", category: "unknown" });
      }
      return toAddress(message.data);
    } catch (error: unknown) {
      throw normalizeError(error, "Something went wrong while updating the address. Please try again.");
    }
  }

  async deleteAddress(id: string): Promise<void> {
    try {
      await apiClient.post<{ message: ErpAddressMessage }>(
        API_ROUTES.ADDRESSES.DELETE,
        { address_name: id },
        { timeout: ADDRESS_TIMEOUT },
      );
    } catch (error: unknown) {
      throw normalizeError(error, "Could not delete the address. Please try again.");
    }
  }

  async setDefaultAddress(id: string): Promise<void> {
    try {
      await apiClient.post<{ message: ErpAddressMessage }>(
        API_ROUTES.ADDRESSES.SET_DEFAULT,
        { address_name: id },
        { timeout: ADDRESS_TIMEOUT },
      );
    } catch (error: unknown) {
      throw normalizeError(error, "Could not update the default address. Please try again.");
    }
  }
}