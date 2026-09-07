/**
 * ERPNext Wishlist Service (LIVE_API mode)
 *
 * Implements IWishlistService backed entirely by the live KeeMeds Commerce
 * wishlist endpoints (keemeds_commerce.api.wishlist):
 *   - GET   get_wishlist
 *   - POST  add_item    { item_code }   (dedupes server-side)
 *   - DELETE remove_item { item_code }
 *
 * Every endpoint returns the full wishlist snapshot. Rows are minimal
 * (item_code/name/brand/image — no price), so each is enriched with the full
 * product via get_product before mapping to WishlistItem. All endpoints
 * require an authenticated non-guest session.
 */

import { apiClient } from "@/api/client";
import { ApiError, fromAxiosError } from "@/api/errors";
import { API_ROUTES } from "@/config/api";
import type { Product } from "@/types/catalog";
import type { ErpWishlistDTO, ErpWishlistItemDTO, ErpWishlistMessage } from "@/types/erpnextCart";
import type { WishlistItem } from "@/store/wishlistStore";
import { ServiceError } from "./authService";
import type { IWishlistService } from "./wishlistService";
import { resolveProducts } from "./erpNextProductResolver";

/** Timeout override preventing wishlist requests from hanging. */
const WISHLIST_TIMEOUT = 30_000;

/** Build a minimal renderable Product straight from the wishlist row. */
function toFallbackProduct(dto: ErpWishlistItemDTO): Product {
  return {
    id: dto.item_code,
    slug: dto.item_code,
    name: String(dto.item_name || dto.item_code),
    brandName: String(dto.brand || "KeeMeds"),
    manufacturer: String(dto.brand || "KeeMeds"),
    categorySlug: "medicines",
    form: "Tablet",
    packSize: "1",
    price: 0,
    mrp: 0,
    discountPercent: 0,
    rating: 0,
    reviewCount: 0,
    requiresPrescription: false,
    stockStatus: "in_stock",
    imageUrl: dto.image || "",
    isNew: false,
    isBestseller: false,
    isTrending: false,
    isLimitedOffer: false,
  };
}

/** Map the server WishlistDTO into frontend WishlistItem[] (enriched). */
async function toWishlistItems(dto: ErpWishlistDTO): Promise<WishlistItem[]> {
  const rows = Array.isArray(dto.items) ? dto.items : [];
  const products = await resolveProducts(rows.map((row) => row.item_code));
  return rows.map((row) => ({
    product: products.get(row.item_code) ?? toFallbackProduct(row),
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
  if (status === 417 || status === 422 || apiErr.category === "validationError") {
    throw new ServiceError(apiErr.message || fallback, "VALIDATION_ERROR", status);
  }
  throw new ServiceError(apiErr.message || fallback, "WISHLIST_ERROR", status);
}

/** Read + unpack the success_response envelope into the raw WishlistDTO. */
async function fetchWishlistDto(
  promise: Promise<{ data: { message: ErpWishlistMessage } }>,
): Promise<ErpWishlistDTO> {
  const response = await promise;
  const message = response.data?.message;
  if (!message?.data) {
    throw new ApiError({ message: "Invalid response from wishlist API", category: "unknown" });
  }
  return message.data;
}

export class ErpNextWishlistService implements IWishlistService {
  readonly name = "ErpNextWishlistService";

  async getWishlist(): Promise<WishlistItem[]> {
    try {
      const dto = await fetchWishlistDto(
        apiClient.get<{ message: ErpWishlistMessage }>(API_ROUTES.WISHLIST.GET, {
          timeout: WISHLIST_TIMEOUT,
        }),
      );
      return toWishlistItems(dto);
    } catch (error: unknown) {
      throw normalizeError(error, "Could not load your wishlist. Please try again.");
    }
  }

  async addItem(itemCode: string): Promise<WishlistItem[]> {
    try {
      const dto = await fetchWishlistDto(
        apiClient.post<{ message: ErpWishlistMessage }>(
          API_ROUTES.WISHLIST.ADD,
          { item_code: itemCode },
          { timeout: WISHLIST_TIMEOUT },
        ),
      );
      return toWishlistItems(dto);
    } catch (error: unknown) {
      throw normalizeError(error, "Could not add the item to your wishlist. Please try again.");
    }
  }

  async removeItem(itemCode: string): Promise<WishlistItem[]> {
    try {
      const dto = await fetchWishlistDto(
        apiClient.delete<{ message: ErpWishlistMessage }>(API_ROUTES.WISHLIST.REMOVE, {
          data: { item_code: itemCode },
          timeout: WISHLIST_TIMEOUT,
        }),
      );
      return toWishlistItems(dto);
    } catch (error: unknown) {
      throw normalizeError(error, "Could not remove the item from your wishlist. Please try again.");
    }
  }
}
