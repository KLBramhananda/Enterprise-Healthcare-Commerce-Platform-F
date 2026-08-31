/**
 * Mapper Barrel
 *
 * Exports all DTO mappers and the generic mapper utilities.
 */

export type { Mapper } from "./types";
export { mapAll, mapResponse, mapPaginatedResponse } from "./types";
export { userMapper } from "./userMapper";
export type { ErpNextUserDto } from "./userMapper";
export { productMapper } from "./productMapper";
export type { ErpNextProductDto } from "./productMapper";
