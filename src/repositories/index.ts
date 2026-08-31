/**
 * Repository Barrel
 *
 * Exports the repository registry and all implementations.
 * When ERPNext repositories are added, import them here and update
 * the factory so the service layer can resolve either mock or real.
 */

import { USE_MOCK_API } from "@/config/env";
import type { RepositoryRegistry } from "./types";
import { MockCatalogRepository, MockAuthRepository } from "./mock";

/**
 * Resolve repository instances based on feature flags.
 *
 * Future ERPNext integration:
 *   - Import ErpNext*Repository classes
 *   - Conditionally instantiate based on USE_ERP_API flag
 *   - The returned registry satisfies the same RepositoryRegistry interface
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

  // Future: return ErpNext repositories here
  // return {
  //   catalog: new ErpNextCatalogRepository(),
  //   auth: new ErpNextAuthRepository(),
  //   ...
  // };

  // Fallback to mocks until ERPNext repos are implemented
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
