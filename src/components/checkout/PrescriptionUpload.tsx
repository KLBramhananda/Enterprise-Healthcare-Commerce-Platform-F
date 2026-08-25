/**
 * PrescriptionUpload
 *
 * File upload component for prescription-required products.
 * Supports multiple files, preview, removal, and validation.
 */

import { useRef } from "react";
import { FileText, UploadCloud, X, AlertCircle } from "lucide-react";
import { usePrescriptionUpload } from "@/hooks/checkout/usePrescriptionUpload";

interface PrescriptionUploadProps {
  requiredProducts: Array<{ id: string; name: string }>;
}

export default function PrescriptionUpload({ requiredProducts }: PrescriptionUploadProps) {
  const { files, addFiles, removeFile, error } = usePrescriptionUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-surface-900">Prescription</h2>
      <p className="mt-0.5 text-sm text-surface-500">
        Upload a valid prescription for the following items:
      </p>

      <ul className="mt-2 space-y-1">
        {requiredProducts.map((p) => (
          <li key={p.id} className="flex items-center gap-2 text-sm text-surface-700">
            <FileText size={14} className="shrink-0 text-brand-600" />
            {p.name}
          </li>
        ))}
      </ul>

      <div
        className="mt-4 rounded-xl border-2 border-dashed border-surface-300 bg-surface-50 p-6 text-center transition-colors hover:border-brand-400"
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
        }}
      >
        <UploadCloud size={24} className="mx-auto text-surface-400" />
        <p className="mt-2 text-sm font-medium text-surface-700">
          Drag &amp; drop or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-brand-600 hover:text-brand-700"
          >
            browse files
          </button>
        </p>
        <p className="mt-1 text-xs text-surface-400">JPG, PNG or PDF &middot; Max 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload prescription files"
        />
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-surface-200 bg-surface-0 px-3 py-2"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={file.dataUrl}
                  alt={file.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-surface-100">
                  <FileText size={16} className="text-surface-500" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-900">{file.name}</p>
                <p className="text-xs text-surface-400">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="shrink-0 rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600"
                aria-label={`Remove ${file.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
