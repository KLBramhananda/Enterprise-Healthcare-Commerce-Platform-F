/**
 * Service Factory
 *
 * Single source of service instances for the entire app.
 * Hooks import { services } from here instead of instantiating Mock*Service
 * directly, so swapping in the real ERPNext backend is a one-file change.
 *
 * Feature flag logic:
 *   - USE_MOCK_API=true  → all mock services (default)
 *   - USE_ERP_API=true   → ERPNext auth + health check services,
 *                            mock for all other domains
 */

import { USE_MOCK_API, USE_ERP_API } from "@/config/env";
import { MockAccountService } from "./accountMock";
import { MockAddressService } from "./addressMock";
import { MockAuthService } from "./authMock";
import { ErpNextAuthService } from "./authErp";
import { MockCatalogService } from "./catalogMock";
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

function createServices() {
  if (USE_MOCK_API) {
    return {
      account: new MockAccountService(),
      address: new MockAddressService(),
      auth: new MockAuthService(),
      catalog: new MockCatalogService(),
      checkout: new MockCheckoutService(),
      payment: new MockPaymentService(),
      engagement: new MockEngagementService(),
      homepage: new MockHomepageService(),
      notification: new MockNotificationService(),
      support: new MockSupportService(),
      healthCheck: new MockHealthCheckService(),
    };
  }

  if (USE_ERP_API) {
    return {
      account: new MockAccountService(),
      address: new MockAddressService(),
      auth: new ErpNextAuthService(),
      catalog: new MockCatalogService(),
      checkout: new MockCheckoutService(),
      payment: new MockPaymentService(),
      engagement: new MockEngagementService(),
      homepage: new MockHomepageService(),
      notification: new MockNotificationService(),
      support: new MockSupportService(),
      healthCheck: new ErpNextHealthCheckService(),
    };
  }

  return {
    account: new MockAccountService(),
    address: new MockAddressService(),
    auth: new MockAuthService(),
    catalog: new MockCatalogService(),
    checkout: new MockCheckoutService(),
    payment: new MockPaymentService(),
    engagement: new MockEngagementService(),
    homepage: new MockHomepageService(),
    notification: new MockNotificationService(),
    support: new MockSupportService(),
    healthCheck: new MockHealthCheckService(),
  };
}

export const services = createServices();