/**
 * WishlistPage
 *
 * Full wishlist page with product cards, move to cart, remove,
 * and empty state. Guest-friendly — no auth required.
 */

import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button, Container, EmptyState } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { useWishlist } from "@/hooks/shopping";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { notifyMovedToCart, notifyRemovedFromWishlist } from "@/utils/notifications";
import { formatCurrency } from "@/utils/formatters";

export default function WishlistPage() {
  usePageTitle("My Wishlist");

  const { items, count, removeItem, moveToCart } = useWishlist();

  const handleMoveToCart = (product: import("@/types/catalog").Product) => {
    moveToCart(product.id);
    notifyMovedToCart(product);
  };

  const handleRemove = (product: import("@/types/catalog").Product) => {
    removeItem(product.id);
    notifyRemovedFromWishlist(product);
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
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            My Wishlist
            <span className="ml-2 text-base font-normal text-surface-500">
              ({count} item{count !== 1 ? "s" : ""})
            </span>
          </h1>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const p = item.product;
            return (
              <article
                key={p.id}
                className="group flex flex-col rounded-xl border border-surface-200 bg-surface-0 p-4 transition-all hover:border-brand-200 hover:shadow-md"
              >
                {/* Product image placeholder */}
                <Link
                  to={`/product/${p.id}`}
                  className="mb-3 flex aspect-square items-center justify-center rounded-lg border border-surface-100 bg-surface-50"
                >
                  <PillGlyph />
                </Link>

                {/* Details */}
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
                          MRP <span className="line-through">{formatCurrency(p.mrp)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => handleMoveToCart(p)}
                    fullWidth
                    size="sm"
                  >
                    <ShoppingCart size={14} className="mr-1.5" aria-hidden="true" />
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
      <rect x="6" y="16" width="36" height="16" rx="8" transform="rotate(-45 24 24)" />
      <line x1="17" y1="17" x2="31" y2="31" />
    </svg>
  );
}
