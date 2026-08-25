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
