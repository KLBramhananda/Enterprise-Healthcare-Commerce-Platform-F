/**
 * ERPNext Attachment Download Helpers
 *
 * Reusable utilities for downloading files from ERPNext. Handles
 * authenticated file downloads, blob conversion, and triggering
 * browser save dialogs.
 *
 * ERPNext file URLs:
 *   - Public files: /files/document.pdf
 *   - Private files: /private/files/document.pdf (requires session auth)
 *   - API endpoint: /api/method/download_file?file_url=<url>
 */

import { apiClient } from "@/api/client";
import type { AttachmentRef } from "./types";

/* ── Download functions ── */

/**
 * Download a file from ERPNext as a Blob.
 * Uses the shared apiClient for authenticated requests.
 *
 * @param fileUrl - The ERPNext file URL (e.g. "/files/doc.pdf" or "/private/files/doc.pdf")
 * @returns The file as a Blob
 */
export async function downloadFileAsBlob(fileUrl: string): Promise<Blob> {
  const response = await apiClient.get(fileUrl, {
    responseType: "blob",
  });
  return response.data as Blob;
}

/**
 * Download a file via the ERPNext download_file API endpoint.
 * Useful when the file URL needs server-side resolution.
 *
 * @param fileUrl - The ERPNext file URL
 * @param downloadFileName - Suggested file name for the download
 * @returns The file as a Blob
 */
export async function downloadViaApi(
  fileUrl: string,
): Promise<Blob> {
  const response = await apiClient.get("/api/method/download_file", {
    params: { file_url: fileUrl },
    responseType: "blob",
  });
  return response.data as Blob;
}

/**
 * Trigger a browser download dialog for a Blob.
 *
 * @param blob - The file data
 * @param fileName - The suggested file name
 */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Download a file and trigger the browser save dialog.
 * Convenience function combining downloadFileAsBlob + triggerDownload.
 */
export async function downloadAndSave(
  fileUrl: string,
  fileName: string,
): Promise<void> {
  const blob = await downloadFileAsBlob(fileUrl);
  triggerDownload(blob, fileName);
}

/* ── Attachment list helpers ── */

/**
 * Fetch the list of attachments for a given document.
 *
 * @param doctype - The DocType name
 * @param docname - The document name
 * @returns Array of attachment references
 */
export async function getAttachments(
  doctype: string,
  docname: string,
): Promise<AttachmentRef[]> {
  const response = await apiClient.get<{
    message: Array<{
      name: string;
      file_name: string;
      file_url: string;
      file_size: number;
      file_type?: string;
    }>;
  }>("/api/method/frappe.client.get_list", {
    params: {
      doctype: "File",
      filters: JSON.stringify([
        ["attached_to_doctype", "=", doctype],
        ["attached_to_name", "=", docname],
      ]),
      fields: JSON.stringify(["name", "file_name", "file_url", "file_size", "file_type"]),
      order_by: "creation asc",
      limit_page_length: 100,
    },
  });

  return (response.data.message ?? []).map((file) => ({
    name: file.name,
    fileName: file.file_name,
    fileUrl: file.file_url,
    fileSize: file.file_size,
    fileType: file.file_type ?? inferFileType(file.file_name),
  }));
}

/**
 * Delete an attachment from ERPNext.
 */
export async function deleteAttachment(fileId: string): Promise<void> {
  await apiClient.delete(`/api/resource/File/${encodeURIComponent(fileId)}`);
}

/* ── Utility functions ── */

/** Infer file type category from file name. */
export function inferFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const docExts = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];
  const videoExts = ["mp4", "webm", "avi", "mov"];

  if (imageExts.includes(ext)) return "image";
  if (docExts.includes(ext)) return "document";
  if (videoExts.includes(ext)) return "video";
  return "other";
}

/**
 * Check if an attachment URL points to a private file.
 */
export function isPrivateAttachment(fileUrl: string): boolean {
  return fileUrl.startsWith("/private/") || fileUrl.includes("/private/files/");
}
