/**
 * WishlistPage
 *
 * Customer wishlist — requires authentication.
 * This page will be built out during the wishlist feature phase.
 */

import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { Container } from "@/components/ui";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  usePageTitle("My Wishlist");

  return (
    <Container>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Heart size={48} className="mx-auto mb-4 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">My Wishlist</h1>
          <p className="mt-2 text-surface-500">
            Save items you love for later.
          </p>
        </div>
      </div>
    </Container>
  );
}
