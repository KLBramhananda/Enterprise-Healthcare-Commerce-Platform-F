/**
 * NotificationsPage
 *
 * Customer notifications — requires authentication.
 * This page will be built out during the notifications feature phase.
 */

import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { Container } from "@/components/ui";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  usePageTitle("Notifications");

  return (
    <Container>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Bell size={48} className="mx-auto mb-4 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">Notifications</h1>
          <p className="mt-2 text-surface-500">
            Stay updated on your orders and offers.
          </p>
        </div>
      </div>
    </Container>
  );
}
