import { useState, useRef, useCallback } from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  File,
} from "lucide-react";
import { Container, Badge, Button, EmptyState, Modal } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { usePrescriptionUpload } from "@/hooks/checkout/usePrescriptionUpload";
import type { PrescriptionFile } from "@/types/checkout";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size < 10 ? size.toFixed(1) : Math.round(size)} ${units[i]}`;
}

export default function PrescriptionsPage() {
  usePageTitle("My Prescriptions");
  const { files, addFiles, removeFile, error, isProcessing } =
    usePrescriptionUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<PrescriptionFile | null>(null);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (fileList && fileList.length > 0) {
        addFiles(fileList);
      }
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDelete = useCallback(
    (file: PrescriptionFile) => {
      if (window.confirm(`Remove "${file.name}" from your prescriptions?`)) {
        removeFile(file.id);
      }
    },
    [removeFile],
  );

  const handleDownload = useCallback((file: PrescriptionFile) => {
    const link = document.createElement("a");
    link.href = file.dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "My Prescriptions" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            My Prescriptions
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Upload and manage your prescriptions for prescription-required
            medicines.
          </p>
        </header>

        {files.length > 0 && (
          <div className="mt-6 flex gap-4">
            <div className="rounded-xl border border-surface-200 bg-surface-0 px-5 py-3">
              <p className="text-xs font-medium text-surface-500">
                Total Files
              </p>
              <p className="text-lg font-bold text-surface-900">
                {files.length}
              </p>
            </div>
            <div className="rounded-xl border border-surface-200 bg-surface-0 px-5 py-3">
              <p className="text-xs font-medium text-surface-500">
                Total Size
              </p>
              <p className="text-lg font-bold text-surface-900">
                {formatFileSize(totalSize)}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border-2 border-dashed border-surface-300 bg-surface-0 p-8 text-center transition-all hover:border-brand-400 hover:bg-brand-50/20"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Upload size={24} />
          </div>
          <p className="text-sm font-semibold text-surface-900">
            {isDragOver
              ? "Drop your files here"
              : isProcessing
                ? "Processing..."
                : "Click to upload or drag and drop"}
          </p>
          <p className="mt-1 text-xs text-surface-500">
            JPG, PNG or PDF (max 10MB)
          </p>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-8">
          {files.length === 0 ? (
            <EmptyState
              title="No prescriptions uploaded"
              description="Upload a prescription to order prescription-required medicines."
            />
          ) : (
            <>
              <h2 className="text-base font-semibold text-surface-900">
                Upload History
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="rounded-xl border border-surface-200 bg-surface-0 p-4 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-100">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={file.dataUrl}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FileText
                              size={24}
                              className="text-surface-400"
                            />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-surface-900">
                          {file.name}
                        </p>
                        <p className="mt-0.5 text-xs text-surface-400">
                          {formatFileSize(file.size)} &middot;{" "}
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2">
                          <Badge variant="info">
                            <CheckCircle size={10} className="mr-1" />
                            Uploaded
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-1 border-t border-surface-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
                        title="Preview"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(file)}
                        className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(file)}
                        className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <Modal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          title={previewFile?.name}
          className="max-w-2xl"
        >
          {previewFile && (
            <div className="flex flex-col items-center">
              {previewFile.type.startsWith("image/") ? (
                <img
                  src={previewFile.dataUrl}
                  alt={previewFile.name}
                  className="max-h-[60vh] w-auto rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-lg bg-surface-50">
                  <div className="text-center">
                    <File
                      size={48}
                      className="mx-auto mb-2 text-surface-300"
                    />
                    <p className="text-sm text-surface-500">
                      PDF preview not available
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        if (previewFile) handleDownload(previewFile);
                      }}
                    >
                      <Download size={14} className="mr-1.5" />
                      Download to view
                    </Button>
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center gap-3 text-xs text-surface-500">
                <span>{formatFileSize(previewFile.size)}</span>
                <span>&middot;</span>
                <span>
                  Uploaded{" "}
                  {new Date(previewFile.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </Modal>
      </Container>
    </div>
  );
}
