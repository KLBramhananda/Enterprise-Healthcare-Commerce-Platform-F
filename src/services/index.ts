/**
 * Services Barrel
 *
 * Exports the active service implementations.
 * To switch to ERPNext, replace Mock*Service with ErpNext*Service.
 */

export type { IAuthService, ServiceError } from "./authService";
export { MockAuthService } from "./authMock";
export type { IHomepageService } from "./homepageService";
export { MockHomepageService } from "./homepageMock";
export type { ICatalogService } from "./catalogService";
export { MockCatalogService } from "./catalogMock";
export type { IAddressService } from "./addressService";
export { MockAddressService } from "./addressMock";
export type { ICheckoutService } from "./checkoutService";
export { MockCheckoutService } from "./checkoutMock";
export type { IPaymentService } from "./paymentService";
export { MockPaymentService } from "./paymentMock";
export type { INotificationService } from "./notificationService";
export { MockNotificationService } from "./notificationMock";
export type { IAccountService } from "./accountService";
export { MockAccountService } from "./accountMock";
export type { IEngagementService } from "./engagementService";
export { MockEngagementService } from "./engagementMock";
export type { ISupportService } from "./supportService";
export { MockSupportService } from "./supportMock";
