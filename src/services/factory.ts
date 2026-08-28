/**
 * Service Factory
 *
 * Single source of service instances for the entire app.
 * Hooks import { services } from here instead of instantiating Mock*Service
 * directly, so swapping in the real ERPNext backend is a one-file change:
 * replace each `new Mock*Service()` below with the corresponding
 * `new ErpNext*Service()` implementation.
 */

import { MockAccountService } from "./accountMock";
import { MockAddressService } from "./addressMock";
import { MockAuthService } from "./authMock";
import { MockCatalogService } from "./catalogMock";
import { MockCheckoutService } from "./checkoutMock";
import { MockPaymentService } from "./paymentMock";
import { MockEngagementService } from "./engagementMock";
import { MockHomepageService } from "./homepageMock";
import { MockNotificationService } from "./notificationMock";
import { MockSupportService } from "./supportMock";

export const services = {
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
};