/**
 * ProfilePage
 *
 * Customer profile management — requires authentication.
 * This page will be built out during the profile feature phase.
 */

import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { Container } from "@/components/ui";
import { User } from "lucide-react";

export default function ProfilePage() {
  usePageTitle("My Profile");

  return (
    <Container>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <User size={48} className="mx-auto mb-4 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">My Profile</h1>
          <p className="mt-2 text-surface-500">
            Manage your account details and preferences.
          </p>
        </div>
      </div>
    </Container>
  );
}
