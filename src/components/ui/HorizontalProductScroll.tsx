/**
 * HorizontalProductScroll
 *
 * Horizontally scrollable row of ProductCard items.
 * Used in homepage sections and product detail recommendation rows.
 */

import { useRef } from "react";
import type { Product } from "@/types/catalog";
import ProductCard from "./ProductCard";

interface HorizontalProductScrollProps {
  products: Product[];
  onAddToCart?: (productId: string) => void;
  isInWishlist?: (productId: string) => boolean;
  onToggleWishlist?: (productId: string) => void;
  className?: string;
}

export function HorizontalProductScroll({ products, onAddToCart, isInWishlist, onToggleWishlist, className = "" }: HorizontalProductScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none"
        role="region"
        aria-label="Product list"
        tabIndex={0}
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[200px] max-w-[240px] flex-none snap-start sm:min-w-[220px] sm:max-w-[260px]">
            <ProductCard
              id={product.id}
              name={product.name}
              brandName={product.brandName}
              form={product.form}
              packSize={product.packSize}
              price={product.price}
              originalPrice={product.mrp}
              discountPercent={product.discountPercent}
              rating={product.rating}
              reviewCount={product.reviewCount}
              requiresPrescription={product.requiresPrescription}
              stockStatus={product.stockStatus}
              imageUrl={product.imageUrl}
              isNew={product.isNew}
              isBestseller={product.isBestseller}
              isInWishlist={isInWishlist?.(product.id)}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
