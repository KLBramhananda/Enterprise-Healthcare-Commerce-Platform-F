/**
 * ProductDetailsPage
 *
 * Enterprise-grade healthcare commerce product detail experience.
 *
 * Two-column layout with an interactive image gallery and a rich product
 * summary, followed by: expandable information sections, prescription
 * guidance, customer reviews and Q&A, frequently-bought-together, and
 * similar / recently-viewed carousels. A sticky purchase bar appears on
 * scroll for quick commerce actions. All data flows through the catalog
 * service abstraction (mock today, ERPNext-ready later).
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  BadgeCheck,
  BadgePercent,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Dna,
  FileText,
  Heart,
  Info,
  Lock,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  PenLine,
  Pill,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Snowflake,
  Sparkles,
  Tag,
  Truck,
  Upload,
  Zap,
} from "lucide-react";
import {
  Button,
  Container,
  EmptyState,
  HorizontalProductScroll,
  ProductGallery,
  QuantitySelector,
  RatingBreakdown,
  SectionHeader,
  Skeleton,
  SkeletonText,
  StarRating,
} from "@/components/ui";
import { Breadcrumb as LayoutBreadcrumb } from "@/components/layout";
import { useCart, useWishlist } from "@/hooks/shopping";
import { useCartStore } from "@/store/cartStore";
import {
  useProductDetails,
  useRelatedProducts,
  useFrequentlyBoughtTogether,
  useSimilarProducts,
  useRecentlyViewed,
  useRecentlyViewedProducts,
} from "@/hooks/catalog";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useToast } from "@/providers/ToastProvider";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  notifyAddedToCart,
  notifyAddedAllToCart,
  notifyAddedToWishlist,
  notifyRemovedFromWishlist,
} from "@/utils/notifications";
import { cn } from "@/utils/cn";
import type { Product, ProductDetails } from "@/types/catalog";

/* ── Category title map for display ── */
const CATEGORY_TITLES: Record<string, string> = {
  medicines: "Medicines",
  wellness: "Wellness",
  "lab-tests": "Lab Tests",
  "health-devices": "Health Devices",
  "personal-care": "Personal Care",
  nutrition: "Nutrition",
  ayurveda: "Ayurveda",
  homeopathy: "Homeopathy",
};

export default function ProductDetailsPage() {
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();
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

  useEffect(() => {
    if (id && detailsQuery.isSuccess) {
      trackView(id);
    }
  }, [id, detailsQuery.isSuccess, trackView]);

  const handleProductAddToCart = (productId: string) => {
    const p =
      relatedQuery.data?.find((x) => x.id === productId) ??
      similarQuery.data?.find((x) => x.id === productId) ??
      recentProductsQuery.data?.find((x) => x.id === productId);
    if (p) {
      addItem(p);
      notifyAddedToCart(p);
    }
  };

  const handleProductWishlistToggle = (productId: string) => {
    const p =
      relatedQuery.data?.find((x) => x.id === productId) ??
      similarQuery.data?.find((x) => x.id === productId) ??
      recentProductsQuery.data?.find((x) => x.id === productId);
    if (!p) return;
    if (isInWishlist(productId)) {
      removeWishlist(productId);
      notifyRemovedFromWishlist(p);
    } else {
      addWishlist(p);
      notifyAddedToWishlist(p);
    }
  };

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
    <div className="bg-surface-50 pb-28 lg:pb-16">
      <Container>
        <LayoutBreadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: details.brandName, path: `/category/${details.categorySlug}` },
            { label: details.name },
          ]}
        />
      </Container>

      {/* ── Gallery + Summary ── */}
      <Container className="mt-5">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <ProductGallerySection details={details} />
          <ProductSummary details={details} />
        </div>
      </Container>

      {/* ── Prescription guidance ── */}
      {details.requiresPrescription && (
        <Container className="mt-8">
          <PrescriptionNotice details={details} />
        </Container>
      )}

      {/* ── Information accordion ── */}
      <Container className="mt-10">
        <ProductInfoSections details={details} />
      </Container>

      {/* ── Reviews + Q&A ── */}
      <Container className="mt-10">
        <ReviewsSection details={details} />
      </Container>

      {/* ── Frequently Bought Together ── */}
      {fbtQuery.data && fbtQuery.data.length > 0 && (
        <Container className="mt-10">
          <FrequentlyBoughtTogetherSection source={details} items={fbtQuery.data} />
        </Container>
      )}

      {/* ── Similar Products ── */}
      {similarQuery.data && similarQuery.data.length > 0 && (
        <Container className="mt-10">
          <SectionHeader
            title="Similar Products"
            subtitle="You might also like these"
          />
          <HorizontalProductScroll
            products={similarQuery.data ?? []}
            isInWishlist={isInWishlist}
            onToggleWishlist={handleProductWishlistToggle}
            onAddToCart={handleProductAddToCart}
            className="mt-6"
          />
        </Container>
      )}

      {/* ── Recently Viewed ── */}
      {recentProductsQuery.data && recentProductsQuery.data.length > 0 && (
        <Container className="mt-10">
          <SectionHeader
            title="Recently Viewed"
            subtitle="Continue browsing where you left off"
          />
          <HorizontalProductScroll
            products={recentProductsQuery.data ?? []}
            isInWishlist={isInWishlist}
            onToggleWishlist={handleProductWishlistToggle}
            onAddToCart={handleProductAddToCart}
            className="mt-6"
          />
        </Container>
      )}

      {/* ── Sticky purchase bar ── */}
      <StickyPurchaseBar details={details} />
    </div>
  );
}

/* ── Image gallery column ── */

function ProductGallerySection({ details }: { details: ProductDetails }) {
  const badge = details.discountPercent > 0 ? (
    <span className="inline-flex items-center gap-1 rounded-lg bg-danger-600 px-2 py-1 text-xs font-bold text-white shadow-sm">
      <BadgePercent size={13} aria-hidden="true" />
      {details.discountPercent}% OFF
    </span>
  ) : undefined;

  return (
    <ProductGallery
      images={details.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt }))}
      productName={details.name}
      badge={badge}
    />
  );
}

/* ── Product summary (right column) ── */

// Cart-quantity sync hook: the quantity selector mirrors the cart quantity
// when the item is already in the cart, and a local value otherwise.
function useProductQuantity(product: ProductDetails) {
  const cartQuantity = useCartStore(
    (s) => s.items.find((i) => i.product.id === product.id)?.quantity ?? 0,
  );
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const isInCart = cartQuantity > 0;
  const [localQty, setLocalQty] = useState(1);

  const quantity = isInCart ? cartQuantity : localQty;
  const setQuantity = (next: number) => {
    if (isInCart) {
      updateQuantity(product.id, Math.max(1, next));
    } else {
      setLocalQty(Math.max(1, next));
    }
  };

  return { quantity, isInCart, setQuantity };
}

function ProductSummary({ details }: { details: ProductDetails }) {
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { quantity, isInCart, setQuantity } = useProductQuantity(details);

  const isOutOfStock = details.stockStatus === "out_of_stock";
  const wishlisted = isInWishlist(details.id);
  const savings = Math.max(0, details.mrp - details.price);

  const handleAddToCart = () => {
    addItem(details, quantity);
    notifyAddedToCart(details, quantity);
  };

  const handleBuyNow = () => {
    addItem(details, quantity);
    notifyAddedToCart(details, quantity);
    navigate("/checkout");
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

  const handleShare = async () => {
    const shareData = { title: details.name, text: `Check out ${details.name} on KeeMeds`, url: window.location.href };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast("Product link copied to clipboard", "success");
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Brand + name + rating */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {details.brandName}
          </p>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-surface-0 px-2.5 py-1.5 text-sm text-surface-600 transition-colors hover:border-surface-300 hover:text-surface-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Share product"
          >
            <Share2 size={14} aria-hidden="true" />
            Share
          </button>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
          {details.name}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <StarRating value={details.rating} size={16} />
          <span className="text-sm text-surface-500">
            {details.rating.toFixed(1)} &middot; {details.reviewCount.toLocaleString()} reviews
          </span>
          {details.isBestseller && (
            <span className="inline-flex items-center gap-1 rounded-md bg-warning-50 px-2 py-0.5 text-xs font-semibold text-warning-800 ring-1 ring-warning-100">
              <Sparkles size={12} aria-hidden="true" /> Bestseller
            </span>
          )}
        </div>
      </div>

      <div className="h-px bg-surface-200" />

      {/* Pricing */}
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-bold tracking-tight text-brand-700">
            {formatCurrency(details.price)}
          </span>
          {details.mrp > details.price && (
            <span className="text-base text-surface-400">
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
        {savings > 0 && (
          <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-success-50 px-2 py-1 text-xs font-medium text-success-700">
            <CheckCircle2 size={13} aria-hidden="true" />
            You save {formatCurrency(savings)} on MRP
          </p>
        )}
        <p className="mt-2 flex items-center gap-1 text-xs text-surface-400">
          <Info size={12} aria-hidden="true" />
          Inclusive of all taxes
        </p>
      </div>

      {/* Availability */}
      <div
        className={cn(
          "rounded-lg border px-4 py-3 text-sm font-medium",
          isOutOfStock
            ? "border-danger-200 bg-danger-50 text-danger-700"
            : "border-success-200 bg-success-50 text-success-700",
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isOutOfStock ? "bg-danger-500" : "bg-success-500",
            )}
            aria-hidden="true"
          />
          {details.availability}
        </span>
      </div>

      {/* Product meta */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-surface-200 bg-surface-0 p-4 text-sm">
        {[
          { label: "Manufacturer", value: details.manufacturer, icon: Building2 },
          { label: "Form", value: details.form, icon: Package },
          { label: "Pack size", value: details.packSize, icon: Package },
          { label: "Strength", value: details.strength, icon: Pill },
          { label: "Category", value: CATEGORY_TITLES[details.categorySlug] ?? details.categorySlug, icon: Tag },
          { label: "SKU", value: details.sku, icon: Dna },
        ].map((row) => (
          <div key={row.label} className="flex items-start gap-2">
            <row.icon size={15} className="mt-0.5 shrink-0 text-surface-400" aria-hidden="true" />
            <div>
              <dt className="text-xs text-surface-400">{row.label}</dt>
              <dd className="font-medium text-surface-800">{row.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {/* Delivery info */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={16} className="shrink-0 text-surface-400" aria-hidden="true" />
            <span className="text-surface-500">Deliver to</span>
            <button
              type="button"
              className="font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              Home, 10001
            </button>
          </div>
        </div>
        <div className="mt-3 space-y-2.5 text-sm">
          <div className="flex items-center gap-2.5">
            <Truck size={16} className="shrink-0 text-brand-600" aria-hidden="true" />
            <span className="text-surface-600">
              {details.freeDelivery ? (
                <>
                  Free delivery &middot;{" "}
                  <span className="font-semibold text-surface-800">
                    by {formatDate(deliveryEstimate(details))}
                  </span>
                </>
              ) : (
                <>
                  Estimated delivery by{" "}
                  <span className="font-semibold text-surface-800">
                    {formatDate(deliveryEstimate(details))}
                  </span>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock size={16} className="shrink-0 text-surface-400" aria-hidden="true" />
            <span className="text-surface-600">
              {details.estimatedDeliveryDays} business day{details.estimatedDeliveryDays > 1 ? "s" : ""}
            </span>
          </div>
          {details.returnable && (
            <div className="flex items-center gap-2.5">
              <RotateCcw size={16} className="shrink-0 text-surface-400" aria-hidden="true" />
              <span className="text-surface-600">Returnable within 7 days of delivery</span>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="shrink-0 text-success-600" aria-hidden="true" />
            <span className="text-surface-600">Genuine product guarantee</span>
          </div>
        </div>
      </div>

      {/* Prescription notice */}
      {details.requiresPrescription && (
        <div className="flex items-start gap-2.5 rounded-xl border border-info-200 bg-info-50 p-4 text-sm text-info-700">
          <FileText size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Prescription required</p>
            <p className="mt-0.5">
              A valid prescription must be uploaded before checkout. Our team will verify it
              promptly.
            </p>
          </div>
        </div>
      )}

      {/* Quantity + primary actions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-surface-700">Quantity</span>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            disabled={isOutOfStock}
          />
          {isInCart && (
            <span className="text-xs text-surface-400">In your cart ({quantity})</span>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleAddToCart} disabled={isOutOfStock} fullWidth size="lg">
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

        <Button onClick={handleWishlist} variant="ghost" size="sm" className="self-start">
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

      {/* Trust strip */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-surface-200 bg-surface-0 p-4 text-xs text-surface-500">
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck size={15} className="text-brand-600" aria-hidden="true" /> 100% genuine
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Lock size={15} className="text-brand-600" aria-hidden="true" /> Secure payments
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Truck size={15} className="text-brand-600" aria-hidden="true" /> Fast delivery
        </span>
      </div>
    </div>
  );
}

function deliveryEstimate(details: ProductDetails): string {
  const date = new Date();
  date.setDate(date.getDate() + details.estimatedDeliveryDays);
  return date.toISOString();
}

/* ── Prescription upload guidance ── */

function PrescriptionNotice({ details }: { details: ProductDetails }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-info-200 bg-info-50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-100 text-info-700">
          <Upload size={18} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-info-800">Upload your prescription</h3>
          <p className="mt-0.5 text-sm text-info-700">
            {details.name} requires a valid prescription. Upload it now for faster order
            processing.
          </p>
        </div>
      </div>
      <Button
        variant="secondary"
        className="shrink-0"
        onClick={() => navigateToPrescriptions()}
      >
        <Upload size={15} className="mr-1.5" aria-hidden="true" />
        Upload Prescription
      </Button>
    </div>
  );
}

function navigateToPrescriptions() {
  window.location.assign("/prescriptions");
}

/* ── Expandable information sections ── */

interface InfoSectionDef {
  key: string;
  label: string;
  icon: typeof FileText;
  render: (details: ProductDetails) => React.ReactNode;
}

const INFO_SECTIONS: InfoSectionDef[] = [
  {
    key: "description",
    label: "Description",
    icon: FileText,
    render: (d) => <p className="text-sm leading-relaxed text-surface-600 sm:text-base">{d.description}</p>,
  },
  {
    key: "uses",
    label: "Uses",
    icon: Sparkles,
    render: (d) => (
      <ul className="space-y-2">
        {d.uses.map((u) => (
          <li key={u} className="flex items-start gap-2 text-sm text-surface-600 sm:text-base">
            <Check size={15} className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" />
            {u}
          </li>
        ))}
      </ul>
    ),
  },
  {
    key: "benefits",
    label: "Key Benefits",
    icon: BadgeCheck,
    render: (d) => (
      <ul className="space-y-2">
        {d.keyBenefits.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-surface-600 sm:text-base">
            <Check size={15} className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" />
            {b}
          </li>
        ))}
      </ul>
    ),
  },
  {
    key: "composition",
    label: "Composition & Ingredients",
    icon: Dna,
    render: (d) => (
      <div className="space-y-3 text-sm text-surface-600 sm:text-base">
        <div>
          <p className="mb-1 font-medium text-surface-700">Composition</p>
          <p className="leading-relaxed">{d.composition}</p>
        </div>
        <div>
          <p className="mb-1 font-medium text-surface-700">Active Ingredient</p>
          <p className="leading-relaxed">{d.ingredients}</p>
        </div>
      </div>
    ),
  },
  {
    key: "directions",
    label: "Directions for Use",
    icon: Pill,
    render: (d) => <p className="text-sm leading-relaxed text-surface-600 sm:text-base">{d.dosage}</p>,
  },
  {
    key: "sideEffects",
    label: "Side Effects",
    icon: AlertTriangle,
    render: (d) =>
      d.sideEffects.length > 0 ? (
        <ul className="space-y-2">
          {d.sideEffects.map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm text-surface-600 sm:text-base">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning-500" aria-hidden="true" />
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-surface-600 sm:text-base">
          No significant side effects reported when used as directed.
        </p>
      ),
  },
  {
    key: "warnings",
    label: "Warnings & Precautions",
    icon: ShieldCheck,
    render: (d) => {
      const items = [...d.warnings, ...d.precautions];
      return (
        <ul className="space-y-2">
          {items.map((w) => (
            <li key={w} className="flex items-start gap-2 text-sm text-surface-600 sm:text-base">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-500" aria-hidden="true" />
              {w}
            </li>
          ))}
        </ul>
      );
    },
  },
  {
    key: "storage",
    label: "Storage Instructions",
    icon: Snowflake,
    render: (d) => <p className="text-sm leading-relaxed text-surface-600 sm:text-base">{d.storage}</p>,
  },
  {
    key: "safety",
    label: "Safety Information",
    icon: Lock,
    render: (d) => <p className="text-sm leading-relaxed text-surface-600 sm:text-base">{d.safetyInformation}</p>,
  },
];

function ProductInfoSections({ details }: { details: ProductDetails }) {
  const [open, setOpen] = useState<Set<string>>(new Set(["description", "composition"]));

  const toggle = (key: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div>
      <SectionHeader title="Product Information" subtitle="Everything you need to know before you order" />
      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-surface-0">
        {INFO_SECTIONS.map((section, index) => {
          const isOpen = open.has(section.key);
          return (
            <div
              key={section.key}
              className={cn(index !== INFO_SECTIONS.length - 1 && "border-b border-surface-100")}
            >
              <button
                type="button"
                onClick={() => toggle(section.key)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-50 sm:px-6"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <section.icon size={16} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-surface-900 sm:text-base">
                    {section.label}
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  className={cn(
                    "shrink-0 text-surface-400 transition-transform duration-fast",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 sm:px-6" data-testid={`section-${section.key}`}>
                  {section.render(details)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Reviews + Q&A ── */

function ReviewsSection({ details }: { details: ProductDetails }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
      <SectionHeader
        title="Ratings & Reviews"
        subtitle="What our customers are saying"
        action={
          <Button variant="secondary" size="sm">
            <PenLine size={15} className="mr-1.5" aria-hidden="true" />
            Write a Review
          </Button>
        }
      />

      <RatingBreakdown
        averageRating={details.reviewSummary.averageRating}
        totalReviews={details.reviewSummary.totalReviews}
        distribution={details.reviewSummary.distribution}
      />

      {/* Review list */}
      <div className="mt-8 space-y-6">
        {details.reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-xl border border-surface-100 bg-surface-50/50 p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700"
                  aria-hidden="true"
                >
                  {review.author.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-surface-900">{review.author}</p>
                  <p className="text-xs text-surface-400">
                    {formatDate(review.date)} &middot; {review.rating}.0 rating
                  </p>
                </div>
              </div>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-medium text-success-700 ring-1 ring-success-100">
                  <BadgeCheck size={12} aria-hidden="true" /> Verified Purchase
                </span>
              )}
            </div>

            <div className="mt-3">
              <StarRating value={review.rating} size={14} />
              <h4 className="mt-1.5 text-sm font-semibold text-surface-900">{review.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-surface-600">{review.content}</p>
            </div>

            {/* Review images placeholder */}
            {review.images.length > 0 && (
              <div className="mt-3 flex gap-2">
                {review.images.map((url, i) => (
                  <div
                    key={i}
                    className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-surface-200 bg-surface-100"
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-xs text-surface-400">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-surface-100 hover:text-surface-600"
              >
                Helpful ({review.helpfulCount})
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Q&A */}
      <div className="mt-10 border-t border-surface-100 pt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-surface-900">Customer Questions & Answers</h3>
          <Button variant="secondary" size="sm">
            <MessageSquare size={15} className="mr-1.5" aria-hidden="true" />
            Ask a Question
          </Button>
        </div>
        <div className="mt-4 space-y-4">
          {details.questions.map((qa) => (
            <div key={qa.id} className="rounded-xl border border-surface-100 bg-surface-50/50 p-4">
              <div className="flex items-start gap-2.5">
                <MessageCircle size={16} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-surface-900">{qa.question}</p>
                  <p className="mt-1 text-xs text-surface-400">
                    Answered by {qa.answeredBy} on {formatDate(qa.date)}
                  </p>
                </div>
              </div>
              <p className="mt-2 pl-[26px] text-sm leading-relaxed text-surface-600">{qa.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Frequently Bought Together ── */

function FrequentlyBoughtTogetherSection({
  source,
  items,
}: {
  source: ProductDetails;
  items: Product[];
}) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(items.map((i) => i.id)));

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
    <div className="rounded-2xl border border-surface-200 bg-surface-0 p-5 sm:p-6">
      <SectionHeader
        title="Frequently Bought Together"
        subtitle="Customers who bought this also purchased"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex-1 divide-y divide-surface-100">
          <div className="flex items-center gap-3 py-3">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-100 text-brand-600">
              <Check size={12} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-surface-900">{source.name}</p>
              <p className="text-xs text-surface-400">{source.brandName}</p>
            </div>
            <span className="text-sm font-bold text-brand-700">{formatCurrency(source.price)}</span>
          </div>

          {items.map((item) => (
            <label
              key={item.id}
              className="-mx-2 flex cursor-pointer items-center gap-3 rounded px-2 py-3 transition-colors hover:bg-surface-50"
            >
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggleItem(item.id)}
                className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-900">{item.name}</p>
                <p className="text-xs text-surface-400">{item.brandName}</p>
              </div>
              <span className="text-sm font-semibold text-surface-700">{formatCurrency(item.price)}</span>
            </label>
          ))}
        </div>

        <div className="shrink-0 rounded-xl border border-surface-200 bg-surface-50 p-4 lg:w-56">
          <p className="text-xs font-medium uppercase tracking-wide text-surface-400">Combined Price</p>
          <p className="mt-1 text-xl font-bold text-brand-700">{formatCurrency(combinedPrice)}</p>
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

/* ── Sticky purchase bar ── */

function StickyPurchaseBar({ details }: { details: ProductDetails }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { quantity, setQuantity } = useProductQuantity(details);
  const [visible, setVisible] = useState(false);

  const isOutOfStock = details.stockStatus === "out_of_stock";

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isOutOfStock && !visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-sticky border-t border-surface-200 bg-surface-0 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-normal ease-smooth lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      aria-hidden={!visible}
    >
      <Container className="flex items-center gap-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-surface-900">{details.name}</p>
          <p className="text-sm font-bold text-brand-700">{formatCurrency(details.price)}</p>
        </div>
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          disabled={isOutOfStock}
          className="hidden sm:inline-flex"
        />
        <Button
          onClick={() => {
            addItem(details, quantity);
            notifyAddedToCart(details, quantity);
            navigate("/checkout");
          }}
          disabled={isOutOfStock}
          size="md"
          className="shrink-0"
        >
          <ShoppingCart size={16} className="mr-1.5" aria-hidden="true" />
          {isOutOfStock ? "Out of Stock" : "Buy Now"}
        </Button>
      </Container>
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Skeleton className="aspect-square w-full flex-1 rounded-2xl" />
            <div className="flex gap-2 sm:flex-col">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-28" />
            <SkeletonText lines={2} className="max-w-xs" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1 rounded-md" />
              <Skeleton className="h-12 flex-1 rounded-md" />
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
        <div className="mt-10 space-y-2 rounded-2xl border border-surface-200 bg-surface-0">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-none first:rounded-t-2xl last:rounded-b-2xl" />
          ))}
        </div>
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
