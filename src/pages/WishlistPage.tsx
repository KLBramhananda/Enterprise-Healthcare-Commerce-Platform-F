import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowUpDown, Share2 } from "lucide-react";
import { Button, Container, EmptyState } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { useWishlist, useCart } from "@/hooks/shopping";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useToast } from "@/providers/ToastProvider";
import {
  notifyMovedToCart,
  notifyRemovedFromWishlist,
  notifyAddedAllToCart,
} from "@/utils/notifications";
import { formatCurrency } from "@/utils/formatters";

type SortKey = "recent" | "price_asc" | "price_desc" | "name";

interface SortOption {
  value: SortKey;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "recent", label: "Recently Added" },
  { value: "price_asc", label: "Price Low to High" },
  { value: "price_desc", label: "Price High to Low" },
  { value: "name", label: "Name A-Z" },
];

export default function WishlistPage() {
  usePageTitle("My Wishlist");

  const { items, count, removeItem, moveToCart, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { addToast } = useToast();

  const [sortBy, setSortBy] = useState<SortKey>("recent");

  const sortedItems = useMemo(() => {
    const copy = [...items];
    switch (sortBy) {
      case "price_asc":
        return copy.sort((a, b) => a.product.price - b.product.price);
      case "price_desc":
        return copy.sort((a, b) => b.product.price - a.product.price);
      case "name":
        return copy.sort((a, b) => a.product.name.localeCompare(b.product.name));
      case "recent":
      default:
        return copy.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
        );
    }
  }, [items, sortBy]);

  const handleMoveToCart = (product: import("@/types/catalog").Product) => {
    moveToCart(product.id);
    notifyMovedToCart(product);
  };

  const handleRemove = (product: import("@/types/catalog").Product) => {
    removeItem(product.id);
    notifyRemovedFromWishlist(product);
  };

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addToCart(item.product);
    });
    clearWishlist();
    notifyAddedAllToCart(count);
  };

  const handleShareWishlist = () => {
    addToast("Share wishlist coming soon!", "info");
  };

  if (items.length === 0) {
    return (
      <div className="bg-surface-50 pb-12">
        <Container>
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "My Wishlist" },
            ]}
          />
          <Container className="py-16">
            <EmptyState
              title="Your wishlist is empty"
              description="Save items you love for later. Browse our catalog to find products you like."
              action={
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <Heart size={16} className="mr-2" aria-hidden="true" />
                  Browse Products
                </Link>
              }
            />
          </Container>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "My Wishlist" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
              My Wishlist
              <span className="ml-2 text-base font-normal text-surface-500">
                ({count} item{count !== 1 ? "s" : ""})
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <ArrowUpDown
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400"
                  aria-hidden="true"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="appearance-none rounded-lg border border-surface-200 bg-surface-0 py-2 pl-8 pr-8 text-sm text-surface-700 transition-colors hover:border-surface-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  aria-label="Sort wishlist"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button variant="secondary" size="sm" onClick={handleShareWishlist}>
                <Share2 size={14} className="mr-1.5" aria-hidden="true" />
                Share
              </Button>

              <Button size="sm" onClick={handleMoveAllToCart}>
                <ShoppingCart size={14} className="mr-1.5" aria-hidden="true" />
                Move All to Cart
              </Button>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedItems.map((item) => {
            const p = item.product;
            return (
              <article
                key={p.id}
                className="group flex flex-col rounded-xl border border-surface-200 bg-surface-0 p-4 hover:border-brand-200 hover:shadow-md transition-all"
              >
                <Link
                  to={`/product/${p.id}`}
                  className="mb-3 flex aspect-square items-center justify-center rounded-lg border border-surface-100 bg-surface-50"
                >
                  <PillGlyph />
                </Link>

                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-surface-400">
                    {p.brandName}
                  </p>
                  <Link
                    to={`/product/${p.id}`}
                    className="text-sm font-semibold text-surface-900 hover:text-brand-600 transition-colors line-clamp-2"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-surface-500">
                    {p.form} &middot; {p.packSize}
                  </p>

                  <div className="mt-auto pt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-brand-700">
                        {formatCurrency(p.price)}
                      </span>
                      {p.mrp > p.price && (
                        <span className="text-xs text-surface-400">
                          MRP{" "}
                          <span className="line-through">
                            {formatCurrency(p.mrp)}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => handleMoveToCart(p)}
                    fullWidth
                    size="sm"
                  >
                    <ShoppingCart
                      size={14}
                      className="mr-1.5"
                      aria-hidden="true"
                    />
                    Move to Cart
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleRemove(p)}
                    className="flex shrink-0 items-center justify-center rounded-lg border border-surface-200 px-3 py-2 text-surface-500 transition-colors hover:border-danger-300 hover:bg-danger-50 hover:text-danger-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                    aria-label={`Remove ${p.name} from wishlist`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </div>
  );
}

function PillGlyph() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-10 w-10 text-surface-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect
        x="6"
        y="16"
        width="36"
        height="16"
        rx="8"
        transform="rotate(-45 24 24)"
      />
      <line x1="17" y1="17" x2="31" y2="31" />
    </svg>
  );
}
