/**
 * usePrescriptionUpload
 *
 * Hook for handling prescription file uploads.
 * Converts files to data URLs for preview, validates type and size.
 */

import { useState, useCallback } from "react";
import { useCheckoutStore } from "@/store/checkoutStore";
import type { PrescriptionFile } from "@/types/checkout";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function usePrescriptionUpload() {
  const addPrescription = useCheckoutStore((s) => s.addPrescription);
  const removePrescription = useCheckoutStore((s) => s.removePrescription);
  const files = useCheckoutStore((s) => s.session.prescriptionFiles);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setError(null);
      setIsProcessing(true);

      const newFiles = Array.from(fileList);
      const validFiles: File[] = [];
      let firstError: string | null = null;

      for (const file of newFiles) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          firstError ??= `"${file.name}" is not a supported file type. Use JPG, PNG, or PDF.`;
          continue;
        }
        if (file.size > MAX_SIZE) {
          firstError ??= `"${file.name}" exceeds the 10MB size limit.`;
          continue;
        }
        validFiles.push(file);
      }

      if (firstError) setError(firstError);

      try {
        for (const file of validFiles) {
          const dataUrl = await readFileAsDataUrl(file);
          const prescription: PrescriptionFile = {
            id: `rx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl,
            uploadedAt: new Date().toISOString(),
          };
          addPrescription(prescription);
        }
      } catch {
        setError("Failed to read the selected file. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
    [addPrescription],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      removePrescription(fileId);
    },
    [removePrescription],
  );

  return { files, addFiles, removeFile, error, isProcessing };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
