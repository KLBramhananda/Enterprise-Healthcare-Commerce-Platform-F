/**
 * OrdersPage
 *
 * Customer order history — requires authentication.
 * This page will be built out during the orders feature phase.
 */

import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { Container } from "@/components/ui";
import { Package } from "lucide-react";

export default function OrdersPage() {
  usePageTitle("My Orders");

  return (
    <Container>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">My Orders</h1>
          <p className="mt-2 text-surface-500">
            Track and manage your orders.
          </p>
        </div>
      </div>
    </Container>
  );
}
