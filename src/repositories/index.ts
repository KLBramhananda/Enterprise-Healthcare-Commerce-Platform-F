/**
 * Repository Barrel
 *
 * Exports the repository registry and all implementations.
 * When ERPNext repositories are added, import them here and update
 * the factory so the service layer can resolve either mock or real.
 */

import { USE_MOCK_API, USE_ERP_API } from "@/config/env";
import type { RepositoryRegistry } from "./types";
import { MockCatalogRepository, MockAuthRepository } from "./mock";
import { ErpNextAuthRepository } from "./erpnext/erpnextAuthRepository";

/**
 * Resolve repository instances based on feature flags.
 *
 * Priority:
 *   1. USE_MOCK_API=true  → all mock repositories (default)
 *   2. USE_ERP_API=true   → ERPNext repositories where implemented,
 *                            mock for domains not yet connected
 */
function createRepositories(): RepositoryRegistry {
  if (USE_MOCK_API) {
    return {
      catalog: new MockCatalogRepository(),
      auth: new MockAuthRepository(),
      cart: { name: "MockCartRepository" } as RepositoryRegistry["cart"],
      orders: { name: "MockOrderRepository" } as RepositoryRegistry["orders"],
      addresses: { name: "MockAddressRepository" } as RepositoryRegistry["addresses"],
      notifications: { name: "MockNotificationRepository" } as RepositoryRegistry["notifications"],
    };
  }

  if (USE_ERP_API) {
    return {
      catalog: new MockCatalogRepository(),
      auth: new ErpNextAuthRepository(),
      cart: { name: "MockCartRepository" } as RepositoryRegistry["cart"],
      orders: { name: "MockOrderRepository" } as RepositoryRegistry["orders"],
      addresses: { name: "MockAddressRepository" } as RepositoryRegistry["addresses"],
      notifications: { name: "MockNotificationRepository" } as RepositoryRegistry["notifications"],
    };
  }

  // Fallback to mocks
  return {
    catalog: new MockCatalogRepository(),
    auth: new MockAuthRepository(),
    cart: { name: "MockCartRepository" } as RepositoryRegistry["cart"],
    orders: { name: "MockOrderRepository" } as RepositoryRegistry["orders"],
    addresses: { name: "MockAddressRepository" } as RepositoryRegistry["addresses"],
    notifications: { name: "MockNotificationRepository" } as RepositoryRegistry["notifications"],
  };
}

export const repositories = createRepositories();

export type {
  BaseRepository,
  PaginatedRepository,
  IdentifiableRepository,
  CRUDRepository,
  ICatalogRepository,
  IAuthRepository,
  ICartRepository,
  IOrderRepository,
  IAddressRepository,
  INotificationRepository,
  RepositoryRegistry,
} from "./types";
