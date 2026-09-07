/**
 * Service Factory
 *
 * Single source of service instances for the entire app.
 * Hooks import { services } from here instead of instantiating Mock*Service
 * directly, so swapping in the real ERPNext backend is a one-file change.
 *
 * Data source strategy (Phase 11 / Phase 12 — non-destructive migration):
 *   Service implementations are selected via the centralized VITE_DATA_SOURCE
 *   environment variable:
 *     - VITE_DATA_SOURCE=STATIC   → Mock services (default, no network)
 *     - VITE_DATA_SOURCE=LIVE_API → ErpNext services (catalog, auth, and
 *                                   addresses backed by ERPNext)
 *
 *   Switching modes only requires changing VITE_DATA_SOURCE — no component
 *   changes. The static mock (including MockAuthService) remains fully
 *   functional and untouched under STATIC.
 *
 * Legacy feature flags (USE_MOCK_API / USE_ERP_API) still control the non-catalog
 * services for backward compatibility.
 */

import { DATA_SOURCE, USE_MOCK_API, USE_ERP_API, PAYMENT_TIMEOUT_MS } from "@/config/env";
import { MockAccountService } from "./accountMock";
import { MockAddressService } from "./addressMock";
import { ErpNextAddressService } from "./addressErpNext";
import { MockAuthService } from "./authMock";
import { ErpNextAuthService } from "./authErp";
import { MockCatalogService } from "./catalogMock";
import { ErpNextCatalogService } from "./catalogErpNext";
import { MockCheckoutService } from "./checkoutMock";
import { ErpNextCheckoutService } from "./checkoutErpNext";
import { PaymentService } from "./paymentService";
import { GatewayUnavailableProvider, SandboxPaymentProvider } from "./paymentProviders";
import { MockEngagementService } from "./engagementMock";
import { MockHomepageService } from "./homepageMock";
import { MockNotificationService } from "./notificationMock";
import { MockSupportService } from "./supportMock";
import { ErpNextCartService } from "./cartErpNext";
import { ErpNextWishlistService } from "./wishlistErpNext";
import {
  MockHealthCheckService,
  ErpNextHealthCheckService,
} from "./healthCheck";

/**
 * Build a service map sharing the same non-catalog instances in every branch.
 * Cart/wishlist are included in every branch for typing simplicity; they are
 * ERP-backed and only ever invoked by the shopping sync layer / stores when
 * DATA_SOURCE === "LIVE_API" (STATIC keeps purely local Zustand persistence).
 */
/**
 * Payment orchestrator wired to the data-source-appropriate gateway provider.
 *   - LIVE_API → GatewayUnavailableProvider (no real aggregator integrated
 *     yet; online payments fail closed, COD unaffected). Swap in a real
 *     provider here when the gateway is integrated.
 *   - STATIC   → SandboxPaymentProvider (local simulator, demo only).
 */
function createPaymentService(): PaymentService {
  return new PaymentService(
    DATA_SOURCE === "LIVE_API"
      ? new GatewayUnavailableProvider()
      : new SandboxPaymentProvider(),
    PAYMENT_TIMEOUT_MS,
  );
}

function baseServices() {
  return {
    account: new MockAccountService(),
    address: new MockAddressService(),
    checkout: new MockCheckoutService(),
    payment: createPaymentService(),
    engagement: new MockEngagementService(),
    homepage: new MockHomepageService(),
    notification: new MockNotificationService(),
    support: new MockSupportService(),
    cart: new ErpNextCartService(),
    wishlist: new ErpNextWishlistService(),
  };
}

function createServices() {
  // Selected by VITE_DATA_SOURCE first (Phase 11 / Phase 12).
  // LIVE_API enables BOTH the live catalog and the live (ERPNext session)
  // authentication. STATIC keeps the full mock stack.
  if (DATA_SOURCE === "LIVE_API") {
    return {
      ...baseServices(),
      auth: new ErpNextAuthService(),
      catalog: new ErpNextCatalogService(),
      address: new ErpNextAddressService(),
      checkout: new ErpNextCheckoutService(),
      healthCheck: new MockHealthCheckService(),
    };
  }

  if (USE_MOCK_API) {
    return {
      ...baseServices(),
      auth: new MockAuthService(),
      catalog: new MockCatalogService(),
      healthCheck: new MockHealthCheckService(),
    };
  }

  if (USE_ERP_API) {
    return {
      ...baseServices(),
      auth: new ErpNextAuthService(),
      catalog: new MockCatalogService(),
      healthCheck: new ErpNextHealthCheckService(),
    };
  }

  return {
    ...baseServices(),
    auth: new MockAuthService(),
    catalog: new MockCatalogService(),
    healthCheck: new MockHealthCheckService(),
  };
}

export const services = createServices();