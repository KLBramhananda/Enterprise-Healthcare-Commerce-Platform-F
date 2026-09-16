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

import { DATA_SOURCE, USE_MOCK_API, USE_ERP_API, PAYMENT_TIMEOUT_MS, PAYMENT_PROVIDER } from "@/config/env";
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
import { RazorpayProvider } from "./razorpayProvider";
import { MockEngagementService } from "./engagementMock";
import { MockHomepageService } from "./homepageMock";
import { MockNotificationService } from "./notificationMock";
import { MockSupportService } from "./supportMock";
import { ErpNextCartService } from "./cartErpNext";
import { ErpNextWishlistService } from "./wishlistErpNext";
import { ErpNextPaymentConfirmationService } from "./paymentConfirmation";
import { MockOrderService } from "./orderMock";
import { ErpNextOrderService } from "./orderErpNext";
import {
  MockHealthCheckService,
  ErpNextHealthCheckService,
} from "./healthCheck";

/**
 * ERP-backed cart/wishlist instances shared across branches so the order
 * service and the shopping sync layer operate on the same cart snapshot
 * source (reorder recreates the ERP cart through this instance).
 */
const liveCart = new ErpNextCartService();
const liveWishlist = new ErpNextWishlistService();

/**
 * Build a service map sharing the same non-catalog instances in every branch.
 * Cart/wishlist are included in every branch for typing simplicity; they are
 * ERP-backed and only ever invoked by the shopping sync layer / stores when
 * DATA_SOURCE === "LIVE_API" (STATIC keeps purely local Zustand persistence).
 */
/**
 * Payment orchestrator wired to the PAYMENT_PROVIDER gateway stand-in.
 * Selection is INDEPENDENT of the data source: the backend can keep using
 * ERPNext (LIVE_API) while the payment gateway is exercised separately.
 *   - SANDBOX  → SandboxPaymentProvider (frontend simulator, demo rules)
 *   - RAZORPAY → RazorpayProvider (placeholder until the SDK is integrated)
 *   - DISABLED → GatewayUnavailableProvider (online payments fail closed,
 *                COD unaffected)
 */
function createPaymentService(): PaymentService {
  switch (PAYMENT_PROVIDER) {
    case "RAZORPAY":
      return new PaymentService(new RazorpayProvider(), PAYMENT_TIMEOUT_MS);
    case "DISABLED":
      return new PaymentService(new GatewayUnavailableProvider(), PAYMENT_TIMEOUT_MS);
    case "SANDBOX":
    default:
      return new PaymentService(new SandboxPaymentProvider(), PAYMENT_TIMEOUT_MS);
  }
}

function baseServices() {
  return {
    account: new MockAccountService(),
    address: new MockAddressService(),
    checkout: new MockCheckoutService(),
    payment: createPaymentService(),
    paymentConfirmation: new ErpNextPaymentConfirmationService(),
    engagement: new MockEngagementService(),
    homepage: new MockHomepageService(),
    notification: new MockNotificationService(),
    support: new MockSupportService(),
    cart: liveCart,
    wishlist: liveWishlist,
    orders: new MockOrderService(),
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
      orders: new ErpNextOrderService(liveCart),
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