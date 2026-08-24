/**
 * AddressesPage
 *
 * Customer saved addresses — requires authentication.
 * This page will be built out during the addresses feature phase.
 */

import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { Container } from "@/components/ui";
import { MapPin } from "lucide-react";

export default function AddressesPage() {
  usePageTitle("My Addresses");

  return (
    <Container>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="mx-auto mb-4 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">My Addresses</h1>
          <p className="mt-2 text-surface-500">
            Manage your delivery addresses.
          </p>
        </div>
      </div>
    </Container>
  );
}
