/**
 * DiscoveryRecommendations
 *
 * Homepage section showcasing Best Sellers, Trending, and New Arrivals
 * as horizontally scrollable product rows.
 */

import { useBestSellers, useTrending, useNewArrivals } from "@/hooks/catalog";
import { HorizontalProductScroll, DiscoverySection } from "@/components/ui";
import { useCart, useWishlist } from "@/hooks/shopping";
import { notifyAddedToCart, notifyAddedToWishlist, notifyRemovedFromWishlist } from "@/utils/notifications";

export function DiscoveryRecommendations() {
  return (
    <div className="bg-surface-50">
      <BestSellersSection />
      <TrendingSection />
      <NewArrivalsSection />
    </div>
  );
}

function BestSellersSection() {
  const query = useBestSellers(12);
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();

  const handleToggleWishlist = (id: string) => {
    const p = query.data?.find((x) => x.id === id);
    if (!p) return;
    if (isInWishlist(id)) { removeWishlist(id); notifyRemovedFromWishlist(p); }
    else { addWishlist(p); notifyAddedToWishlist(p); }
  };

  return (
    <DiscoverySection
      title="Best Sellers"
      subtitle="Most popular products loved by our customers"
      viewAllHref="/collections/best-sellers"
      isLoading={query.isLoading}
      isEmpty={!query.isLoading && (query.data?.length ?? 0) === 0}
      skeletonCount={4}
    >
      <HorizontalProductScroll products={query.data ?? []} onAddToCart={(id) => { const p = query.data?.find((x) => x.id === id); if (p) { addItem(p); notifyAddedToCart(p); } }} isInWishlist={isInWishlist} onToggleWishlist={handleToggleWishlist} />
    </DiscoverySection>
  );
}

function TrendingSection() {
  const query = useTrending(12);
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();

  const handleToggleWishlist = (id: string) => {
    const p = query.data?.find((x) => x.id === id);
    if (!p) return;
    if (isInWishlist(id)) { removeWishlist(id); notifyRemovedFromWishlist(p); }
    else { addWishlist(p); notifyAddedToWishlist(p); }
  };

  return (
    <DiscoverySection
      title="Trending Now"
      subtitle="Products gaining momentum this week"
      viewAllHref="/collections/trending"
      isLoading={query.isLoading}
      isEmpty={!query.isLoading && (query.data?.length ?? 0) === 0}
      skeletonCount={4}
    >
      <HorizontalProductScroll products={query.data ?? []} onAddToCart={(id) => { const p = query.data?.find((x) => x.id === id); if (p) { addItem(p); notifyAddedToCart(p); } }} isInWishlist={isInWishlist} onToggleWishlist={handleToggleWishlist} />
    </DiscoverySection>
  );
}

function NewArrivalsSection() {
  const query = useNewArrivals(12);
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();

  const handleToggleWishlist = (id: string) => {
    const p = query.data?.find((x) => x.id === id);
    if (!p) return;
    if (isInWishlist(id)) { removeWishlist(id); notifyRemovedFromWishlist(p); }
    else { addWishlist(p); notifyAddedToWishlist(p); }
  };

  return (
    <DiscoverySection
      title="New Arrivals"
      subtitle="Fresh additions to our catalog"
      viewAllHref="/collections/new-arrivals"
      isLoading={query.isLoading}
      isEmpty={!query.isLoading && (query.data?.length ?? 0) === 0}
      skeletonCount={4}
    >
      <HorizontalProductScroll products={query.data ?? []} onAddToCart={(id) => { const p = query.data?.find((x) => x.id === id); if (p) { addItem(p); notifyAddedToCart(p); } }} isInWishlist={isInWishlist} onToggleWishlist={handleToggleWishlist} />
    </DiscoverySection>
  );
}
