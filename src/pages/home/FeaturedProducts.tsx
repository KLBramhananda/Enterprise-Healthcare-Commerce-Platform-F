/**
 * FeaturedProducts
 *
 * Featured products grid placeholder for product catalog display.
 */

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui";

const placeholders = Array.from({ length: 8 }, (_, i) => ({
  id: `product-${i + 1}`,
  name: `Product ${i + 1}`,
}));

export default function FeaturedProducts() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Featured Products</h2>
            <p className="mt-1 text-sm text-slate-500">Handpicked healthcare essentials for you</p>
          </div>
          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {placeholders.map((product) => (
            <div
              key={product.id}
              className="group rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-emerald-200 hover:shadow-sm sm:p-4"
            >
              {/* Product Image Placeholder */}
              <div className="mb-3 flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
                <span className="text-xs text-slate-400">Image</span>
              </div>

              {/* Product Info Placeholder */}
              <div className="space-y-2">
                <div className="h-3 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-4 w-16 rounded bg-emerald-100" />
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
