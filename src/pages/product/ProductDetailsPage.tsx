/**
 * ProductDetailsPage
 *
 * Full product detail experience for the commerce catalog.
 * Two-column layout with image gallery + product info above,
 * and structured information sections, related products, and
 * frequently bought together below. All data sourced via the
 * catalog service abstraction.
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BadgePercent,
  BadgeCheck,
  Check,
  ChevronDown,
  FileBadge,
  Heart,
  Info,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Zap,
} from "lucide-react";
import {
  Button,
  Container,
  EmptyState,
  ImageGallery,
  ProductCard,
  QuantitySelector,
  RatingBreakdown,
  SectionHeader,
  Skeleton,
  StarRating,
} from "@/components/ui";
import { Breadcrumb as LayoutBreadcrumb } from "@/components/layout";
import { useCart, useWishlist } from "@/hooks/shopping";
import {
  useProductDetails,
  useRelatedProducts,
  useFrequentlyBoughtTogether,
  useSimilarProducts,
  useRecentlyViewed,
  useRecentlyViewedProducts,
} from "@/hooks/catalog";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { formatCurrency } from "@/utils/formatters";
import {
  notifyAddedToCart,
  notifyAddedAllToCart,
  notifyAddedToWishlist,
  notifyRemovedFromWishlist,
} from "@/utils/notifications";
import { cn } from "@/utils/cn";
import type { ProductDetails } from "@/types/catalog";

export default function ProductDetailsPage() {
  const { addItem } = useCart();
  const { id } = useParams<{ id: string }>();
  const detailsQuery = useProductDetails(id);
  const relatedQuery = useRelatedProducts(id);
  const fbtQuery = useFrequentlyBoughtTogether(id);
  const similarQuery = useSimilarProducts(id);
  const { ids: recentIds, trackView } = useRecentlyViewed();
  const recentProductsQuery = useRecentlyViewedProducts(
    recentIds.filter((rid) => rid !== id).slice(0, 8),
  );

  const details = detailsQuery.data;

  usePageTitle(details?.name ?? "Product", details?.brandName);

  // Track current product as recently viewed
  useEffect(() => {
    if (id && detailsQuery.isSuccess) {
      trackView(id);
    }
  }, [id, detailsQuery.isSuccess, trackView]);

  if (detailsQuery.isLoading) {
    return <DetailsSkeleton />;
  }

  if (detailsQuery.isError || !details) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Product not found"
          description="The product you are looking for does not exist or may have been removed."
          action={
            <Link
              to="/categories"
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Browse categories
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <div className="bg-surface-50 pb-16">
      <Container>
        <LayoutBreadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: details.brandName, path: `/category/${details.categorySlug}` },
            { label: details.name },
          ]}
        />
      </Container>

      {/* ── Gallery + Info ── */}
      <Container className="mt-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px] lg:gap-10">
          <ImageGallery
            images={details.images.map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
            }))}
            productName={details.name}
          />
          <ProductInfoSection details={details} />
        </div>
      </Container>

      {/* ── Detail Sections ── */}
      <Container className="mt-10">
        <ProductInfoSections details={details} />
      </Container>

      {/* ── Rating Breakdown ── */}
      <Container className="mt-8">
        <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
          <SectionHeader title="Customer Reviews" subtitle="Rating distribution from verified purchases" />
          <RatingBreakdown
            averageRating={details.reviewSummary.averageRating}
            totalReviews={details.reviewSummary.totalReviews}
            distribution={details.reviewSummary.distribution}
          />
          <div className="mt-6 rounded-lg border-2 border-dashed border-surface-200 bg-surface-50/50 p-8 text-center">
            <Info size={20} className="mx-auto mb-2 text-surface-300" />
            <p className="text-sm text-surface-500">
              Detailed reviews will be available after ERPNext integration.
            </p>
          </div>
        </div>
      </Container>

      {/* ── Frequently Bought Together ── */}
      {fbtQuery.data && fbtQuery.data.length > 0 && (
        <Container className="mt-10">
          <FrequentlyBoughtTogetherSection
            source={details}
            items={fbtQuery.data}
          />
        </Container>
      )}

      {/* ── Related Products ── */}
      {relatedQuery.data && relatedQuery.data.length > 0 && (
        <Container className="mt-10">
          <SectionHeader
            title="Related Products"
            subtitle={`More from ${details.brandName}`}
          />
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {relatedQuery.data.map((product) => (
              <div key={product.id} className="w-52 shrink-0">
                <ProductCard {...product} originalPrice={product.mrp} onAddToCart={(id) => { const p = relatedQuery.data?.find((x) => x.id === id) ?? similarQuery.data?.find((x) => x.id === id) ?? recentProductsQuery.data?.find((x) => x.id === id); if (p) { addItem(p); notifyAddedToCart(p); } }} />
              </div>
            ))}
          </div>
        </Container>
      )}

      {/* ── Similar Products ── */}
      {similarQuery.data && similarQuery.data.length > 0 && (
        <Container className="mt-10">
          <SectionHeader
            title="Similar Products"
            subtitle="You might also like these"
          />
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {similarQuery.data.map((product) => (
              <div key={product.id} className="w-52 shrink-0">
                <ProductCard {...product} originalPrice={product.mrp} onAddToCart={(id) => { const p = relatedQuery.data?.find((x) => x.id === id) ?? similarQuery.data?.find((x) => x.id === id) ?? recentProductsQuery.data?.find((x) => x.id === id); if (p) { addItem(p); notifyAddedToCart(p); } }} />
              </div>
            ))}
          </div>
        </Container>
      )}

      {/* ── Recently Viewed ── */}
      {recentProductsQuery.data && recentProductsQuery.data.length > 0 && (
        <Container className="mt-10">
          <SectionHeader
            title="Recently Viewed"
            subtitle="Continue browsing where you left off"
          />
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {recentProductsQuery.data.map((product) => (
              <div key={product.id} className="w-52 shrink-0">
                <ProductCard {...product} originalPrice={product.mrp} onAddToCart={(id) => { const p = relatedQuery.data?.find((x) => x.id === id) ?? similarQuery.data?.find((x) => x.id === id) ?? recentProductsQuery.data?.find((x) => x.id === id); if (p) { addItem(p); notifyAddedToCart(p); } }} />
              </div>
            ))}
          </div>
        </Container>
      )}
    </div>
  );
}

/* ── Product Info Section (right column) ── */

function ProductInfoSection({ details }: { details: ProductDetails }) {
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = details.stockStatus === "out_of_stock";
  const wishlisted = isInWishlist(details.id);

  const handleAddToCart = () => {
    addItem(details, quantity);
    notifyAddedToCart(details, quantity);
  };

  const handleBuyNow = () => {
    addItem(details, quantity);
    notifyAddedToCart(details, quantity);
  };

  const handleWishlist = () => {
    if (wishlisted) {
      removeWishlist(details.id);
      notifyRemovedFromWishlist(details);
    } else {
      addWishlist(details);
      notifyAddedToWishlist(details);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Brand */}
      <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">
        {details.brandName}
      </p>

      {/* Name */}
      <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
        {details.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <StarRating value={details.rating} size={16} />
        <span className="text-sm text-surface-500">
          {details.rating} ({details.reviewCount.toLocaleString()} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-2xl font-bold text-brand-700">
          {formatCurrency(details.price)}
        </span>
        {details.mrp > details.price && (
          <span className="text-sm text-surface-400">
            MRP <span className="line-through">{formatCurrency(details.mrp)}</span>
          </span>
        )}
        {details.discountPercent > 0 && (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-danger-600 px-1.5 py-0.5 text-xs font-bold text-white">
            <BadgePercent size={11} aria-hidden="true" />
            {details.discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Stock */}
      {isOutOfStock ? (
        <p className="text-sm font-semibold text-danger-600">Out of Stock</p>
      ) : details.stockStatus === "low_stock" ? (
        <p className="text-sm font-medium text-danger-600">Only a few left — order soon</p>
      ) : (
        <p className="text-sm font-medium text-success-600">In Stock</p>
      )}

      {/* Product meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-surface-500">
        <span>{details.form}</span>
        <span>&middot;</span>
        <span>{details.packSize}</span>
        <span>&middot;</span>
        <span>{details.manufacturer}</span>
      </div>

      {/* Prescription */}
      {details.requiresPrescription && (
        <div className="flex items-center gap-2 rounded-lg border border-info-200 bg-info-50 px-3 py-2 text-sm text-info-700">
          <FileBadge size={16} className="shrink-0" aria-hidden="true" />
          Prescription required — upload a valid prescription before checkout
        </div>
      )}

      {/* Quantity + Actions */}
      <div className="mt-2 flex flex-col gap-3 border-t border-surface-200 pt-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-surface-700">Quantity</span>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            disabled={isOutOfStock}
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            fullWidth
            size="lg"
          >
            <ShoppingCart size={18} className="mr-2" aria-hidden="true" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            variant="secondary"
            fullWidth
            size="lg"
          >
            <Zap size={18} className="mr-2" aria-hidden="true" />
            Buy Now
          </Button>
        </div>

        <Button
          onClick={handleWishlist}
          variant="ghost"
          size="sm"
          className="self-start"
        >
          <Heart
            size={16}
            className={cn(
              "mr-1.5 transition-colors",
              wishlisted ? "fill-danger-500 text-danger-500" : "text-surface-400",
            )}
            aria-hidden="true"
          />
          {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
        </Button>
      </div>

      {/* Delivery info */}
      <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 space-y-2 text-sm text-surface-600">
        <div className="flex items-center gap-2">
          <BadgeCheck size={16} className="text-success-600 shrink-0" aria-hidden="true" />
          <span>
            Estimated delivery in{" "}
            <span className="font-semibold">{details.estimatedDeliveryDays} business day{details.estimatedDeliveryDays > 1 ? "s" : ""}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-success-600 shrink-0" aria-hidden="true" />
          <span>Genuine product guarantee</span>
        </div>
        {details.returnable && (
          <div className="flex items-center gap-2">
            <RotateCcw size={16} className="text-surface-400 shrink-0" aria-hidden="true" />
            <span>Returnable within 7 days of delivery</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Collapsible Detail Sections ── */

type SectionKey = "description" | "benefits" | "dosage" | "precautions" | "storage" | "composition" | "faqs";

const SECTION_META: Record<SectionKey, { label: string; order: number }> = {
  description: { label: "Description", order: 0 },
  benefits: { label: "Key Benefits", order: 1 },
  dosage: { label: "Dosage Information", order: 2 },
  composition: { label: "Composition & Ingredients", order: 3 },
  precautions: { label: "Precautions & Warnings", order: 4 },
  storage: { label: "Storage Instructions", order: 5 },
  faqs: { label: "Frequently Asked Questions", order: 6 },
};

function ProductInfoSections({ details }: { details: ProductDetails }) {
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(
    new Set(["description", "composition", "faqs"]),
  );

  const toggle = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const sections: { key: SectionKey; content: React.ReactNode }[] = [
    {
      key: "description",
      content: <p className="text-sm leading-relaxed text-surface-600">{details.description}</p>,
    },
    {
      key: "benefits",
      content: (
        <ul className="space-y-2">
          {details.keyBenefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-surface-600">
              <Check size={14} className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" />
              {b}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "dosage",
      content: <p className="text-sm leading-relaxed text-surface-600">{details.dosage}</p>,
    },
    {
      key: "composition",
      content: (
        <div className="space-y-3 text-sm text-surface-600">
          <div>
            <p className="mb-1 font-medium text-surface-700">Composition</p>
            <p className="leading-relaxed">{details.composition}</p>
          </div>
          <div>
            <p className="mb-1 font-medium text-surface-700">Active Ingredient</p>
            <p className="leading-relaxed">{details.ingredients}</p>
          </div>
        </div>
      ),
    },
    {
      key: "precautions",
      content: (
        <ul className="space-y-2">
          {details.precautions.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-surface-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-500" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "storage",
      content: <p className="text-sm leading-relaxed text-surface-600">{details.storage}</p>,
    },
    {
      key: "faqs",
      content: (
        <div className="divide-y divide-surface-100">
          {details.faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      ),
    },
  ];

  const sorted = [...sections].sort(
    (a, b) => (SECTION_META[a.key]?.order ?? 0) - (SECTION_META[b.key]?.order ?? 0),
  );

  return (
    <div className="space-y-1 rounded-xl border border-surface-200 bg-surface-0">
      {sorted.map(({ key, content }) => {
        const isOpen = openSections.has(key);
        return (
          <div key={key}>
            <button
              type="button"
              onClick={() => toggle(key)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-surface-900 transition-colors hover:bg-surface-50"
            >
              {SECTION_META[key]?.label}
              <ChevronDown
                size={16}
                className={cn(
                  "shrink-0 text-surface-400 transition-transform duration-fast",
                  isOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4">{content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── FAQ Item ── */

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="first:pt-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 py-3 text-left text-sm font-medium text-surface-700 transition-colors hover:text-surface-900"
      >
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-surface-400 transition-transform duration-fast",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
        {question}
      </button>
      {open && <p className="pb-3 pl-7 text-sm leading-relaxed text-surface-500">{answer}</p>}
    </div>
  );
}

/* ── Frequently Bought Together ── */

function FrequentlyBoughtTogetherSection({
  source,
  items,
}: {
  source: ProductDetails;
  items: ProductDetails["id"] extends string ? import("@/types/catalog").Product[] : never;
}) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(items.map((i) => i.id)),
  );

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedItems = items.filter((i) => selected.has(i.id));
  const combinedPrice = source.price + selectedItems.reduce((sum, i) => sum + i.price, 0);
  const combinedMrp = source.mrp + selectedItems.reduce((sum, i) => sum + i.mrp, 0);

  const handleAddAll = () => {
    addItem(source);
    selectedItems.forEach((item) => addItem(item));
    notifyAddedAllToCart(selectedItems.length + 1);
  };

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
      <SectionHeader
        title="Frequently Bought Together"
        subtitle="Customers who bought this also purchased"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Items list */}
        <div className="flex-1 divide-y divide-surface-100">
          {/* Source product */}
          <div className="flex items-center gap-3 py-3">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-100 text-brand-600">
              <Check size={12} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-surface-900 truncate">{source.name}</p>
              <p className="text-xs text-surface-400">{source.brandName}</p>
            </div>
            <span className="text-sm font-bold text-brand-700">{formatCurrency(source.price)}</span>
          </div>

          {items.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 py-3 transition-colors hover:bg-surface-50 -mx-2 px-2 rounded"
            >
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggleItem(item.id)}
                className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-surface-900 truncate">{item.name}</p>
                <p className="text-xs text-surface-400">{item.brandName}</p>
              </div>
              <span className="text-sm font-semibold text-surface-700">{formatCurrency(item.price)}</span>
            </label>
          ))}
        </div>

        {/* Summary */}
        <div className="shrink-0 rounded-lg border border-surface-200 bg-surface-50 p-4 lg:w-56">
          <p className="text-xs font-medium uppercase tracking-wide text-surface-400">
            Combined Price
          </p>
          <p className="mt-1 text-xl font-bold text-brand-700">
            {formatCurrency(combinedPrice)}
          </p>
          {combinedMrp > combinedPrice && (
            <p className="text-xs text-surface-400">
              You save {formatCurrency(combinedMrp - combinedPrice)} (
              {Math.round(((combinedMrp - combinedPrice) / combinedMrp) * 100)}%)
            </p>
          )}
          <Button onClick={handleAddAll} fullWidth className="mt-3" size="sm">
            <ShoppingCart size={14} className="mr-1.5" aria-hidden="true" />
            Add All to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Loading Skeleton ── */

function DetailsSkeleton() {
  return (
    <div className="bg-surface-50 pb-16">
      <Container>
        <Skeleton className="h-4 w-64" />
      </Container>
      <Container className="mt-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px] lg:gap-10">
          {/* Gallery skeleton */}
          <div className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-lg sm:h-20 sm:w-20" />
              ))}
            </div>
          </div>
          {/* Info skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full rounded-md" />
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1 rounded-md" />
              <Skeleton className="h-12 flex-1 rounded-md" />
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
        {/* Sections skeleton */}
        <div className="mt-10 space-y-2 rounded-xl border border-surface-200 bg-surface-0">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-none first:rounded-t-xl last:rounded-b-xl" />
          ))}
        </div>
        {/* Related skeleton */}
        <div className="mt-10">
          <Skeleton className="mb-6 h-7 w-48" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-64 w-52 shrink-0 rounded-xl" />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
