/**
 * PrescriptionsPage
 *
 * Customer prescriptions — requires authentication.
 * This page will be built out during the prescriptions feature phase.
 */

import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { Container } from "@/components/ui";
import { ClipboardList } from "lucide-react";

export default function PrescriptionsPage() {
  usePageTitle("My Prescriptions");

  return (
    <Container>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <ClipboardList size={48} className="mx-auto mb-4 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">My Prescriptions</h1>
          <p className="mt-2 text-surface-500">
            Upload and manage your prescriptions.
          </p>
        </div>
      </div>
    </Container>
  );
}
