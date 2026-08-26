/**
 * MiniCartDrawer
 *
 * Slide-in cart drawer showing cart items, quantity controls,
 * price summary, and empty state. Triggered from CommerceHeader.
 */

import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button, EmptyState, QuantitySelector, ProductImage } from "@/components/ui";
import { useCart } from "@/hooks/shopping";
import { formatCurrency } from "@/utils/formatters";

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCartDrawer({ isOpen, onClose }: MiniCartDrawerProps) {
  const { items, totalItems, totalPrice, totalMrp, totalSavings, updateQuantity, removeItem } = useCart();

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Shopping Cart">
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
          <EmptyState
            title="Your cart is empty"
            description="Browse our catalog and add products to your cart."
            action={
              <Link
                to="/categories"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <ShoppingBag size={16} className="mr-2" aria-hidden="true" />
                Browse Products
              </Link>
            }
          />
        </div>
      ) : (
        <>
          {/* Items */}
          <ul className="divide-y divide-surface-100" role="list" aria-label="Cart items">
            {items.map((item) => (
              <li key={item.product.id} className="flex gap-3 px-5 py-4">
                {/* Product placeholder */}
                <div className="h-16 w-16 shrink-0">
                  <ProductImage src={item.product.imageUrl} alt={`${item.product.name} product image`} aspect="square" size="sm" className="h-16 w-16 border-0" />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/product/${item.product.id}`}
                    onClick={onClose}
                    className="text-sm font-semibold text-surface-900 hover:text-brand-600 transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-surface-400">{item.product.brandName}</p>
                  <p className="mt-0.5 text-xs text-surface-400">
                    {item.product.form} &middot; {item.product.packSize}
                  </p>

                  {/* Price */}
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-brand-700">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-xs text-surface-400">
                        ({formatCurrency(item.product.price)} each)
                      </span>
                    )}
                  </div>

                  {/* Quantity + Remove */}
                  <div className="mt-2 flex items-center gap-2">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(qty) => updateQuantity(item.product.id, qty)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      className="rounded p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-danger-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="border-t border-surface-200 bg-surface-50 px-5 py-4 space-y-3">
            {/* Price summary */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-surface-600">
                <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                <span className="font-medium text-surface-900">{formatCurrency(totalPrice)}</span>
              </div>
              {totalMrp > totalPrice && (
                <div className="flex justify-between text-surface-500">
                  <span>Total MRP</span>
                  <span className="line-through">{formatCurrency(totalMrp)}</span>
                </div>
              )}
              {totalSavings > 0 && (
                <div className="flex justify-between font-medium text-success-600">
                  <span>Total Savings</span>
                  <span>{formatCurrency(totalSavings)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-surface-200 pt-1.5 text-base font-bold text-surface-900">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* Actions */}
            <Button fullWidth size="lg" disabled>
              <ArrowRight size={16} className="mr-2" aria-hidden="true" />
              Checkout Coming Soon
            </Button>
            <Link
              to="/wishlist"
              onClick={onClose}
              className="block text-center text-sm font-medium text-brand-600 hover:underline"
            >
              View Wishlist
            </Link>
          </div>
        </>
      )}
    </Drawer>
  );
}

