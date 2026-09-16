/**
 * ERPNext Cart Service (LIVE_API mode)
 *
 * Implements ICartService backed entirely by the live KeeMeds Commerce
 * cart endpoints (keemeds_commerce.api.cart):
 *   - GET   get_cart
 *   - POST  add_item      { item_code, quantity }
 *   - PUT   update_item   { item_code, quantity }
 *   - DELETE remove_item  { item_code }
 *   - DELETE clear_cart
 *
 * Every endpoint returns the full cart snapshot, so every call re-hydrates
 * the frontend mirror and the React Query cache from the authoritative
 * server state (ERP is the source of truth).
 *
 * DTO mapping notes:
 *   - CartItemDTO only carries item_code/name/brand/image/selling_price/
 *     stock_status/quantity, so each row is enriched with the full product
 *     (form, pack size, category, images, ...) via get_product. Items that
 *     fail to resolve use a minimal row-derived product so the drawer still
 *     renders.
 *   - All mutating endpoints require an authenticated non-guest session;
 *     failures surface as ServiceError (validation → 417, missing item → 404).
 */

import { apiClient } from "@/api/client";
import { ApiError, fromAxiosError } from "@/api/errors";
import { API_ROUTES } from "@/config/api";
import type { Product } from "@/types/catalog";
import type { ErpCartDTO, ErpCartItemDTO, ErpCartMessage } from "@/types/erpnextCart";
import type { CartItem } from "@/store/cartStore";
import { ServiceError } from "./authService";
import type { ICartService } from "./cartService";
import { resolveProducts } from "./erpNextProductResolver";

/** Timeout override preventing cart requests from hanging. */
const CART_TIMEOUT = 30_000;

/** Build a minimal renderable Product straight from the cart row. */
function toFallbackProduct(dto: ErpCartItemDTO): Product {
  const price = Number(dto.selling_price) || 0;
  return {
    id: dto.item_code,
    slug: dto.item_code,
    name: String(dto.item_name || dto.item_code),
    brandName: String(dto.brand || "KeeMeds"),
    manufacturer: String(dto.brand || "KeeMeds"),
    categorySlug: "medicines",
    form: "Tablet",
    packSize: "1",
    price,
    mrp: price,
    discountPercent: 0,
    rating: 0,
    reviewCount: 0,
    requiresPrescription: false,
    stockStatus: dto.stock_status === "out_of_stock" ? "out_of_stock" : "in_stock",
    imageUrl: dto.image || "",
    isNew: false,
    isBestseller: false,
    isTrending: false,
    isLimitedOffer: false,
  };
}

/** Map the server CartDTO into frontend CartItem[] (riched via get_product). */
async function toCartItems(dto: ErpCartDTO): Promise<CartItem[]> {
  const rows = Array.isArray(dto.items) ? dto.items : [];
  const products = await resolveProducts(rows.map((row) => row.item_code));
  return rows.map((row) => ({
    product: products.get(row.item_code) ?? toFallbackProduct(row),
    quantity: Number(row.quantity) || 0,
    addedAt: new Date().toISOString(),
  }));
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
  // The backend rejects stock/quantity violations as 417.
  if (status === 417 || status === 422 || apiErr.category === "validationError") {
    throw new ServiceError(apiErr.message || fallback, "VALIDATION_ERROR", status);
  }
  throw new ServiceError(apiErr.message || fallback, "CART_ERROR", status);
}

/** Read + unpack the success_response envelope into the raw CartDTO. */
async function fetchCartDto(promise: Promise<{ data: { message: ErpCartMessage } }>): Promise<ErpCartDTO> {
  const response = await promise;
  const message = response.data?.message;
  if (!message?.data) {
    throw new ApiError({ message: "Invalid response from cart API", category: "unknown" });
  }
  return message.data;
}

export class ErpNextCartService implements ICartService {
  readonly name = "ErpNextCartService";

  async getCart(): Promise<CartItem[]> {
    try {
      const dto = await fetchCartDto(
        apiClient.get<{ message: ErpCartMessage }>(API_ROUTES.CART.GET, { timeout: CART_TIMEOUT }),
      );
      return toCartItems(dto);
    } catch (error: unknown) {
      throw normalizeError(error, "Could not load your cart. Please try again.");
    }
  }

  async addItem(itemCode: string, quantity: number): Promise<CartItem[]> {
    try {
      const dto = await fetchCartDto(
        apiClient.post<{ message: ErpCartMessage }>(
          API_ROUTES.CART.ADD,
          { item_code: itemCode, quantity },
          { timeout: CART_TIMEOUT },
        ),
      );
      return toCartItems(dto);
    } catch (error: unknown) {
      throw normalizeError(error, "Could not add the item to your cart. Please try again.");
    }
  }

  async updateItem(itemCode: string, quantity: number): Promise<CartItem[]> {
    try {
      const dto = await fetchCartDto(
        apiClient.put<{ message: ErpCartMessage }>(
          API_ROUTES.CART.UPDATE,
          { item_code: itemCode, quantity },
          { timeout: CART_TIMEOUT },
        ),
      );
      return toCartItems(dto);
    } catch (error: unknown) {
      throw normalizeError(error, "Could not update the item in your cart. Please try again.");
    }
  }

  async removeItem(itemCode: string): Promise<CartItem[]> {
    try {
      const dto = await fetchCartDto(
        apiClient.delete<{ message: ErpCartMessage }>(API_ROUTES.CART.REMOVE, {
          data: { item_code: itemCode },
          timeout: CART_TIMEOUT,
        }),
      );
      return toCartItems(dto);
    } catch (error: unknown) {
      throw normalizeError(error, "Could not remove the item from your cart. Please try again.");
    }
  }

  async clearCart(): Promise<CartItem[]> {
    try {
      const dto = await fetchCartDto(
        apiClient.delete<{ message: ErpCartMessage }>(API_ROUTES.CART.CLEAR, { timeout: CART_TIMEOUT }),
      );
      return toCartItems(dto);
    } catch (error: unknown) {
      throw normalizeError(error, "Could not clear your cart. Please try again.");
    }
  }
}
