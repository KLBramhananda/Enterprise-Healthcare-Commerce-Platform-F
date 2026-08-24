/**
 * CheckoutPage
 *
 * Customer checkout flow — requires authentication.
 * This page will be built out during the checkout feature phase.
 */

import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { Container } from "@/components/ui";
import { Lock } from "lucide-react";

export default function CheckoutPage() {
  usePageTitle("Checkout");

  return (
    <Container>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Lock size={48} className="mx-auto mb-4 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">Checkout</h1>
          <p className="mt-2 text-surface-500">
            Complete your purchase securely.
          </p>
        </div>
      </div>
    </Container>
  );
}
