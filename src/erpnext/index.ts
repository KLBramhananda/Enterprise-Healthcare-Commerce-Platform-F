/**
 * ERPNext Shared Infrastructure Barrel
 *
 * Centralized exports for all reusable ERPNext application services.
 * Import from this module to access any shared ERP infrastructure.
 *
 * @example
 * import {
 *   rpcCall, getList, uploadFile,
 *   erpItemKeys, useErpNextCreate,
 *   ErpNextBaseRepository,
 *   extractAuditMeta,
 * } from "@/erpnext";
 */

/* ── Types ── */
export type {
  FrappeDoc,
  AuditMeta,
  ERPNextListParams,
  ERPNextSortParam,
  ERPNextFilterParam,
  ERPNextFilterTuple,
  ERPNextRpcParams,
  ErpDoctype,
  PermissionLevel,
  PermissionCheck,
  ErpNextFileUpload,
  ErpNextFileResponse,
  AttachmentRef,
} from "./types";
export {
  ERP_DOCTYPES,
  toFilterTuple,
  toOrderByString,
} from "./types";

/* ── Request helpers ── */
export {
  rpcCall,
  rpc,
  getDoc,
  getList,
  getCount,
  getValue,
  insertDoc,
  updateDoc,
  patchDoc,
  deleteDoc,
  bulkInsert,
  bulkSetValues,
  uploadFile,
  buildOrderBy,
} from "./request";

/* ── Response parsing ── */
export {
  parseRpcResponse,
  parseRpcPaginatedResponse,
  parseDocResponse,
  parseListResponse,
  parsePaginatedResponse,
  ok,
  okPaginated,
  fail,
  extractAudit,
  extractErrorMessage,
  parseFrappeError,
  extractFieldErrors,
} from "./response";
export type { FrappeFieldError } from "./response";

/* ── Pagination ── */
export {
  computePaginationMeta,
  clampPage,
  toFrappeListParams,
  fromFrappeListResponse,
  paginationToSearchParams,
  paginationFromSearchParams,
  generatePageRange,
  createPagination,
} from "./pagination";
export type { PaginationState, PaginationMeta, PageRangeItem } from "./pagination";

/* ── Query keys ── */
export {
  ERP_ROOT,
  erpItemKeys,
  erpItemGroupKeys,
  erpCustomerKeys,
  erpOrderKeys,
  erpAddressKeys,
  erpContactKeys,
  erpFileKeys,
  erpUserKeys,
  erpHealthcareKeys,
  erpSettingsKeys,
  createModuleKeys,
} from "./queryKeys";

/* ── Mutations ── */
export {
  useErpNextCreate,
  useErpNextUpdate,
  useErpNextPatch,
  useErpNextDelete,
  useErpNextBulkCreate,
} from "./mutations";
export type {
  ModuleQueryKeys,
  CreateMutationOptions,
  UpdateMutationOptions,
  DeleteMutationOptions,
} from "./mutations";

/* ── File upload ── */
export {
  validateFile,
  validateFiles,
  uploadSingleFile,
  uploadMultipleFiles,
  formatFileSize,
  getFileExtension,
  isImageFile,
  IMAGE_VALIDATION,
  DOCUMENT_VALIDATION,
  PRESCRIPTION_VALIDATION,
} from "./upload";
export type { FileValidationConfig, FileValidationResult, UploadProgressCallback, UploadResult } from "./upload";

/* ── Attachment download ── */
export {
  downloadFileAsBlob,
  downloadViaApi,
  triggerDownload,
  downloadAndSave,
  getAttachments,
  deleteAttachment,
  inferFileType,
  isPrivateAttachment,
} from "./download";

/* ── Permissions ── */
export {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  canPerform,
  canRead,
  canCreate,
  canWrite,
  canDelete,
  getDocTypePermissions,
  isAdministrator,
  isSystemManager,
  isHealthcareProfessional,
  getVisibility,
  createEmptyPermissionContext,
  mergePermissionContexts,
  ERP_ROLES,
} from "./permissions";
export type {
  ErpNextRole,
  ErpNextPermission,
  UserPermissionContext,
  PermissionAction,
  UiVisibility,
} from "./permissions";

/* ── Audit metadata ── */
export {
  extractAuditMeta,
  extractAuditFromRecord,
  formatAuditTimestamp,
  formatRelativeTime,
  formatUserDisplay,
  compareTimestamps,
  wasModifiedAfter,
  timeSinceModified,
  lastUpdatedSummary,
  createdSummary,
} from "./audit";

/* ── Repository base classes ── */
export { ErpNextBaseRepository, ErpNextStubRepository } from "./repository";
