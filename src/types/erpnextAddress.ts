/**
 * ERPNext Address API Types
 *
 * DTOs matching the actual KeeMeds Commerce ERPNext customer/address
 * endpoints (keemeds_commerce.api.customer):
 *   - GET  /api/method/keemeds_commerce.api.customer.list_addresses
 *   - GET  /api/method/keemeds_commerce.api.customer.get_address
 *   - POST /api/method/keemeds_commerce.api.customer.create_address
 *   - POST /api/method/keemeds_commerce.api.customer.update_address
 *   - POST /api/method/keemeds_commerce.api.customer.delete_address
 *   - POST /api/method/keemeds_commerce.api.customer.set_default_shipping
 *
 * Verified response contract (September 2026) against
 * `keemeds_commerce/domain/address.py` (AddressDTO) and
 * `keemeds_commerce/services/customer_service.py` (customer_service):
 *
 *   list_addresses →
 *     { message: { success, message,
 *                  data: { addresses: ErpAddressDTO[], total: number } } }
 *
 *   get/create/update/set_default_shipping →
 *     { message: { success, message, data: ErpAddressDTO } }
 *
 *   delete_address → { message: { success, message, data: null } }
 *
 * Field names intentionally use the snake_case of the live API. Response
 * envelope mirrors `keemeds_commerce/utils/api_response.success_response`.
 */

/** A single ERPNext Address as returned by the customer address endpoints. */
export interface ErpAddressDTO {
  name: string;
  address_type: string;
  address_title: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email_id: string;
  is_primary_address: boolean;
  is_shipping_address: boolean;
}

/** List payload returned by list_addresses. */
export interface ErpAddressListData {
  addresses: ErpAddressDTO[];
  total: number;
}

/** Outer `message` payload of a list_addresses response. */
export interface ErpAddressListMessage {
  success: boolean;
  message: string;
  data: ErpAddressListData;
}

/** Outer `message` payload of single-address responses. */
export interface ErpAddressMessage {
  success: boolean;
  message: string;
  data: ErpAddressDTO | null;
}