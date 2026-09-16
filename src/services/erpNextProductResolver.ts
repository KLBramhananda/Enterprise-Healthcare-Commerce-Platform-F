/**
 * ERPNext Product Resolver (shared)
 *
 * Resolves a set of item_codes into full frontend Product objects by calling
 * get_product for each code. Used by the cart and wishlist ERPNext services
 * because both DTOs are intentionally minimal (item_code, name, brand, image,
 * selling price / stock) and don't carry the image-list, dosage-form, Rx flag
 * and other UI fields the product pages render.
 *
 * Resolution failures never fail the whole cart/wishlist load: unknown items
 * are skipped and the caller falls back to a minimal row-derived product so
 * the drawer/list still renders.
 */

import { apiClient } from "@/api/client";
import { API_ROUTES } from "@/config/api";
import { productDetailMapper } from "@/mappers/productMapper";
import type { Product } from "@/types/catalog";
import type { ErpProductDetailMessage } from "@/types/erpnextProduct";

/** Per-product request timeout (resolution is parallelized). */
const PRODUCT_TIMEOUT = 15_000;

export async function resolveProducts(itemCodes: string[]): Promise<Map<string, Product>> {
  const map = new Map<string, Product>();
  if (itemCodes.length === 0) return map;

  const resolved = await Promise.all(
    itemCodes.map(async (itemCode) => {
      try {
        const response = await apiClient.get<{ message: ErpProductDetailMessage }>(
          API_ROUTES.PRODUCTS.GET,
          { params: { item_code: itemCode }, timeout: PRODUCT_TIMEOUT },
        );
        const dto = response.data?.message?.data;
        return { itemCode, product: dto ? productDetailMapper.toDomain(dto) : undefined };
      } catch {
        return { itemCode, product: undefined };
      }
    }),
  );

  for (const entry of resolved) {
    if (entry.product) map.set(entry.itemCode, entry.product);
  }
  return map;
}
