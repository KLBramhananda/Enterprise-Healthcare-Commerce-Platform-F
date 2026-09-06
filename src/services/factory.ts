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
 *     - VITE_DATA_SOURCE=LIVE_API → ErpNext services (catalog + auth from ERPNext)
 *
 *   Switching modes only requires changing VITE_DATA_SOURCE — no component
 *   changes. The static mock (including MockAuthService) remains fully
 *   functional and untouched under STATIC.
 *
 * Legacy feature flags (USE_MOCK_API / USE_ERP_API) still control the non-catalog
 * services for backward compatibility.
 */

import { DATA_SOURCE, USE_MOCK_API, USE_ERP_API } from "@/config/env";
import { MockAccountService } from "./accountMock";
import { MockAddressService } from "./addressMock";
import { MockAuthService } from "./authMock";
import { ErpNextAuthService } from "./authErp";
import { MockCatalogService } from "./catalogMock";
import { ErpNextCatalogService } from "./catalogErpNext";
import { MockCheckoutService } from "./checkoutMock";
import { MockPaymentService } from "./paymentMock";
import { MockEngagementService } from "./engagementMock";
import { MockHomepageService } from "./homepageMock";
import { MockNotificationService } from "./notificationMock";
import { MockSupportService } from "./supportMock";
import {
  MockHealthCheckService,
  ErpNextHealthCheckService,
} from "./healthCheck";

/** Build a service map sharing the same non-catalog instances in every branch. */
function baseServices() {
  return {
    account: new MockAccountService(),
    address: new MockAddressService(),
    checkout: new MockCheckoutService(),
    payment: new MockPaymentService(),
    engagement: new MockEngagementService(),
    homepage: new MockHomepageService(),
    notification: new MockNotificationService(),
    support: new MockSupportService(),
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