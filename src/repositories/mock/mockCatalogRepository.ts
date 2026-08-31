/**
 * Mock Catalog Repository
 *
 * Mock implementation of ICatalogRepository. Returns mock-shaped data directly
 * without HTTP calls. When ERPNext is connected, replace this with an
 * ErpNextCatalogRepository that uses apiClient and maps DTOs.
 *
 * This mock passes responses through the ApiResponse envelope shape so the
 * service layer consumes the same data structure regardless of backend.
 */

import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CatalogCategory,
  CatalogQuery,
  Product,
  ProductDetails,
  SearchQuery,
  SearchResult,
} from "@/types/catalog";
import type { ICatalogRepository } from "../types";

const MOCK_DELAY = 150;

const emptyList = <T,>(): ApiResponse<T[]> => ({ success: true, message: "ok", data: [] });

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), MOCK_DELAY));
}

/**
 * Currency placeholder — the repository layer is wired so the service factory
 * can inject either MockCatalogRepository or ErpNextCatalogRepository. Both
 * satisfy ICatalogRepository, so the service layer never changes.
 */
export class MockCatalogRepository implements ICatalogRepository {
  readonly name = "MockCatalogRepository";

  async getCategories(): Promise<ApiResponse<CatalogCategory[]>> {
    return delay(emptyList<CatalogCategory>());
  }

  async getProducts(query?: CatalogQuery): Promise<PaginatedResponse<Product>> {
    return delay({
      success: true,
      message: "ok",
      data: {
        items: [],
        total: 0,
        page: query?.page ?? 1,
        page_size: query?.pageSize ?? 12,
      },
    });
  }

  async getProductDetails(): Promise<ApiResponse<ProductDetails>> {
    throw new Error("MockCatalogRepository.getProductDetails — delegate to catalogService");
  }

  async searchProducts(query: SearchQuery): Promise<ApiResponse<SearchResult>> {
    return delay({
      success: true,
      message: "ok",
      data: {
        query: query.q,
        items: [],
        total: 0,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 12,
        totalPages: 0,
        categoryFacets: [],
      },
    });
  }

  async getRelatedProducts(): Promise<ApiResponse<Product[]>> {
    return delay(emptyList<Product>());
  }

  async getBestSellers(): Promise<ApiResponse<Product[]>> {
    return delay(emptyList<Product>());
  }

  async getTrending(): Promise<ApiResponse<Product[]>> {
    return delay(emptyList<Product>());
  }

  async getNewArrivals(): Promise<ApiResponse<Product[]>> {
    return delay(emptyList<Product>());
  }
}
