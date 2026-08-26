/**
 * FeaturedMedicines
 *
 * Featured medicines grid with discount and prescription badges.
 * Content is sourced from the homepage service layer.
 * Uses Container, SectionHeader, ProductCard, SkeletonCard from the design system.
 */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeader, ProductCard, Grid, SkeletonCard } from "@/components/ui";
import { useHomepageContent } from "@/hooks/homepage";
import { useCart, useWishlist } from "@/hooks/shopping";
import { notifyAddedToCart, notifyAddedToWishlist, notifyRemovedFromWishlist } from "@/utils/notifications";
import type { Product } from "@/types/catalog";

export default function FeaturedMedicines() {
  const { data, isLoading } = useHomepageContent();
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();

  return (
    <section className="bg-surface-50 py-10 sm:py-12">
      <Container>
        <SectionHeader
          title="Featured Medicines"
          subtitle="Handpicked healthcare essentials at the best prices"
          action={
            <Link
              to="/category/medicines"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors duration-fast hover:text-brand-700"
            >
              View All
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        />

        <Grid
          cols={2}
          gap="sm"
          responsive={{ sm: { cols: 3, gap: "md" }, lg: { cols: 4 } }}
          className="md:gap-x-5 md:gap-y-6"
        >
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={`skel-${i}`} />)
            : data?.featuredMedicines.map((medicine) => (
                <ProductCard key={medicine.id} {...medicine} isInWishlist={isInWishlist(medicine.id)} onAddToCart={(id) => { const m = data?.featuredMedicines.find((x) => x.id === id); if (m) { addItem(m as Product); notifyAddedToCart(m as Product); } }} onToggleWishlist={(id) => { const m = data?.featuredMedicines.find((x) => x.id === id); if (m) { if (isInWishlist(id)) { removeWishlist(id); notifyRemovedFromWishlist(m as Product); } else { addWishlist(m as Product); notifyAddedToWishlist(m as Product); } } }} />
              ))}
        </Grid>
      </Container>
    </section>
  );
}
