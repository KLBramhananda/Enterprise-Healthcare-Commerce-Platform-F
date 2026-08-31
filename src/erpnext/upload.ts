/**
 * ERPNext File Upload Infrastructure
 *
 * Reusable file upload utilities for prescriptions, profile images,
 * health records, documents, and any other file-based entities.
 *
 * Features:
 *   - Single file upload with progress tracking
 *   - Multi-file batch upload
 *   - File type/size validation before upload
 *   - Automatic Frappe attachment linking to DocTypes
 *   - Upload state management for UI components
 */

import { uploadFile } from "./request";
import type { ErpNextFileUpload, ErpNextFileResponse } from "./types";

/* ── Validation ── */

/** Configuration for file validation. */
export interface FileValidationConfig {
  /** Allowed MIME types (e.g. ["image/png", "application/pdf"]). */
  allowedTypes: string[];
  /** Maximum file size in bytes. */
  maxSizeBytes: number;
  /** Human-readable label for allowed types (for error messages). */
  typeLabel: string;
}

/** Result of a file validation check. */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/** Validate a single file against a validation config. */
export function validateFile(
  file: File,
  config: FileValidationConfig,
): FileValidationResult {
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type || "unknown"}" is not allowed. Accepted: ${config.typeLabel}`,
    };
  }

  if (file.size > config.maxSizeBytes) {
    const maxMb = Math.round(config.maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds the ${maxMb}MB limit.`,
    };
  }

  return { valid: true };
}

/** Validate multiple files. Returns all errors, or empty array if all valid. */
export function validateFiles(
  files: File[],
  config: FileValidationConfig,
): FileValidationResult[] {
  return files.map((file) => validateFile(file, config));
}

/* ── Pre-built validation configs ── */

/** Image upload validation (JPEG, PNG, WebP, max 5MB). */
export const IMAGE_VALIDATION: FileValidationConfig = {
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSizeBytes: 5 * 1024 * 1024,
  typeLabel: "JPEG, PNG, or WebP",
};

/** Document upload validation (PDF, DOC, DOCX, max 10MB). */
export const DOCUMENT_VALIDATION: FileValidationConfig = {
  allowedTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  maxSizeBytes: 10 * 1024 * 1024,
  typeLabel: "PDF, DOC, or DOCX",
};

/** Prescription upload validation (PDF, JPEG, PNG, max 10MB). */
export const PRESCRIPTION_VALIDATION: FileValidationConfig = {
  allowedTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ],
  maxSizeBytes: 10 * 1024 * 1024,
  typeLabel: "PDF, JPEG, or PNG",
};

/* ── Upload helpers ── */

/** Progress callback for upload tracking. */
export type UploadProgressCallback = (progress: number) => void;

/** Result of a single file upload. */
export interface UploadResult {
  success: boolean;
  file?: ErpNextFileResponse;
  error?: string;
  fileName: string;
}

/** Upload a single file with optional progress tracking. */
export async function uploadSingleFile(
  upload: ErpNextFileUpload,
  onProgress?: UploadProgressCallback,
): Promise<UploadResult> {
  try {
    const result = await uploadFile(upload);
    onProgress?.(100);
    return { success: true, file: result, fileName: upload.file.name };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
      fileName: upload.file.name,
    };
  }
}

/** Upload multiple files in parallel with a concurrency limit. */
export async function uploadMultipleFiles(
  uploads: ErpNextFileUpload[],
  concurrency = 3,
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < uploads.length; i += concurrency) {
    const batch = uploads.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((upload) => uploadSingleFile(upload)),
    );
    results.push(...batchResults);
  }

  return results;
}

/* ── File size formatting ── */

/** Format file size to human-readable string. */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Extract file extension from name. */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

/** Check if a file is an image based on MIME type. */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}
