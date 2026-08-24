/**
 * LoyaltyPage
 *
 * Customer loyalty/rewards — requires authentication.
 * This page will be built out during the loyalty feature phase.
 */

import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { Container } from "@/components/ui";
import { Award } from "lucide-react";

export default function LoyaltyPage() {
  usePageTitle("Rewards");

  return (
    <Container>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Award size={48} className="mx-auto mb-4 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">Rewards & Loyalty</h1>
          <p className="mt-2 text-surface-500">
            Earn and redeem points on your purchases.
          </p>
        </div>
      </div>
    </Container>
  );
}
