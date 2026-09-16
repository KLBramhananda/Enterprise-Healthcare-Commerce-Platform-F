/**
 * FeaturedMedicines
 *
 * Featured medicines grid with discount and prescription badges.
 * Content is sourced live from the catalog service (ERPNext in LIVE_API
 * mode). Uses Container, SectionHeader, ProductCard, SkeletonCard from the
 * design system.
 */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeader, ProductCard, Grid, SkeletonCard } from "@/components/ui";
import { useFeaturedMedicines } from "@/hooks/catalog";
import { useProductActions } from "@/hooks/shopping";

const FEATURED_MEDICINES_COUNT = 8;

export default function FeaturedMedicines() {
  const query = useFeaturedMedicines(FEATURED_MEDICINES_COUNT);
  const featured = query.data ?? [];
  const { handleAddToCart, handleToggleWishlist, isInWishlist } = useProductActions(featured);

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
          {query.isLoading
            ? Array.from({ length: FEATURED_MEDICINES_COUNT }, (_, i) => <SkeletonCard key={`skel-${i}`} />)
            : featured.map((medicine) => (
                <ProductCard key={medicine.id} {...medicine} isInWishlist={isInWishlist(medicine.id)} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} />
              ))}
        </Grid>
      </Container>
    </section>
  );
}