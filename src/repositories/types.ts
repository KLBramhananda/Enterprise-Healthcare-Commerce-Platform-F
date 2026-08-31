/**
 * Repository Types
 *
 * Defines the Repository pattern layer that sits between Application Services
 * and the data source (mock or ERPNext). Repositories own all data access
 * concerns: HTTP calls, request mapping, response mapping, and caching hints.
 *
 * Architecture:
 *   React Component → Hook → Service Interface → Repository Interface → (Mock | ErpNext)
 *
 * The service layer calls repository methods and returns domain types.
 * The repository layer translates between API DTOs and domain models.
 * This separation means swapping mock→ERPNext only requires new repository
 * implementations — services, hooks, and components remain untouched.
 */

import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { CatalogQuery, PaginatedResult, Product, ProductDetails, SearchQuery, SearchResult } from "@/types/catalog";

/* ── Generic repository contract ── */

/** Base operations common to all repositories. */
export interface BaseRepository {
  /** Human-readable name for logging/debugging. */
  readonly name: string;
}

/** Supports paginated list retrieval. */
export interface PaginatedRepository<TItem, TQuery = void> extends BaseRepository {
  findAll(query?: TQuery): Promise<PaginatedResult<TItem>>;
}

/** Supports single-item retrieval by ID. */
export interface IdentifiableRepository<TItem> extends BaseRepository {
  findById(id: string): Promise<TItem>;
}

/** Supports CRUD operations. */
export interface CRUDRepository<TItem, TCreate, TUpdate = TCreate> extends BaseRepository {
  create(data: TCreate): Promise<TItem>;
  update(id: string, data: TUpdate): Promise<TItem>;
  remove(id: string): Promise<void>;
}

/* ── Domain-specific repository interfaces ── */

export interface ICatalogRepository extends BaseRepository {
  getCategories(): Promise<ApiResponse<import("@/types/catalog").CatalogCategory[]>>;
  getProducts(query?: CatalogQuery): Promise<PaginatedResponse<import("@/types/catalog").Product>>;
  getProductDetails(id: string): Promise<ApiResponse<ProductDetails>>;
  searchProducts(query: SearchQuery): Promise<ApiResponse<SearchResult>>;
  getRelatedProducts(id: string): Promise<ApiResponse<Product[]>>;
  getBestSellers(limit?: number): Promise<ApiResponse<Product[]>>;
  getTrending(limit?: number): Promise<ApiResponse<Product[]>>;
  getNewArrivals(limit?: number): Promise<ApiResponse<Product[]>>;
}

export interface IAuthRepository extends BaseRepository {
  login(email: string, password: string): Promise<ApiResponse<import("@/types/auth").AuthResponse>>;
  register(data: import("@/types/auth").RegisterPayload): Promise<ApiResponse<import("@/types/auth").AuthResponse>>;
  logout(): Promise<ApiResponse<void>>;
  getCurrentUser(): Promise<ApiResponse<import("@/types/auth").User>>;
}

export interface ICartRepository extends BaseRepository {
  getCart(): Promise<ApiResponse<unknown>>;
  addItem(productId: string, quantity: number): Promise<ApiResponse<unknown>>;
  updateItem(productId: string, quantity: number): Promise<ApiResponse<unknown>>;
  removeItem(productId: string): Promise<ApiResponse<unknown>>;
  clearCart(): Promise<ApiResponse<unknown>>;
}

export interface IOrderRepository extends BaseRepository {
  getOrders(): Promise<PaginatedResponse<import("@/types/checkout").Order>>;
  getOrder(orderId: string): Promise<ApiResponse<import("@/types/checkout").Order>>;
  getInvoice(orderId: string): Promise<ApiResponse<import("@/types/checkout").Invoice>>;
}

export interface IAddressRepository extends BaseRepository {
  getAddresses(): Promise<ApiResponse<import("@/types/checkout").Address[]>>;
  createAddress(data: import("@/types/checkout").AddressFormData): Promise<ApiResponse<import("@/types/checkout").Address>>;
  updateAddress(id: string, data: import("@/types/checkout").AddressFormData): Promise<ApiResponse<import("@/types/checkout").Address>>;
  deleteAddress(id: string): Promise<ApiResponse<void>>;
}

export interface INotificationRepository extends BaseRepository {
  getNotifications(): Promise<ApiResponse<import("@/types/account").Notification[]>>;
  markRead(id: string): Promise<ApiResponse<void>>;
  markAllRead(): Promise<ApiResponse<void>>;
}

/* ── Repository registry (for DI) ── */

export interface RepositoryRegistry {
  catalog: ICatalogRepository;
  auth: IAuthRepository;
  cart: ICartRepository;
  orders: IOrderRepository;
  addresses: IAddressRepository;
  notifications: INotificationRepository;
}
