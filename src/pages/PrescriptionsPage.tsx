/**
 * PrescriptionsPage
 *
 * Prescription management page showing uploaded prescriptions
 * and upload functionality.
 */

import { Container, EmptyState } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { usePrescriptionUpload } from "@/hooks/checkout/usePrescriptionUpload";

export default function PrescriptionsPage() {
  usePageTitle("My Prescriptions");
  const { files } = usePrescriptionUpload();

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
            Upload and manage your prescriptions for prescription-required medicines.
          </p>
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
            {files.length === 0 ? (
              <EmptyState
                title="No prescriptions uploaded"
                description="Upload a prescription to order prescription-required medicines."
              />
            ) : (
              <div>
                <h2 className="text-base font-semibold text-surface-900">
                  Uploaded Prescriptions ({files.length})
                </h2>
                <div className="mt-3 space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3"
                    >
                      {file.type.startsWith("image/") ? (
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-surface-100">
                          <span className="text-xs font-medium text-surface-500">PDF</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-surface-900">{file.name}</p>
                        <p className="text-xs text-surface-400">
                          Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
