/**
 * CollectionCard
 *
 * Display tile for a collection. Renders a full-width card with
 * accent color strip, title, description, and product count.
 */

import { Link } from "react-router-dom";
import type { Collection } from "@/types/catalog";
import { COLLECTION_META } from "@/config/constants";

interface CollectionCardProps {
  collection: Collection;
  className?: string;
}

const ACCENT_CLASSES: Record<string, string> = {
  brand: "from-brand-600 to-brand-400",
  blue: "from-blue-600 to-blue-400",
  purple: "from-purple-600 to-purple-400",
  amber: "from-amber-600 to-amber-400",
  green: "from-green-600 to-green-400",
  pink: "from-pink-600 to-pink-400",
};

export function CollectionCard({ collection, className = "" }: CollectionCardProps) {
  const meta = COLLECTION_META[collection.slug];
  const accent = meta?.accent ?? "brand";
  const gradientClass = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.brand;

  return (
    <Link
      to={`/collections/${collection.slug}`}
      className={`group block overflow-hidden rounded-xl border border-surface-border bg-surface-elevated transition-all hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${className}`}
    >
      <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />
      <div className="p-6">
        <h3 className="text-body-lg font-semibold text-text-primary group-hover:text-brand-600 transition-colors">
          {collection.title}
        </h3>
        {collection.description && (
          <p className="mt-1 text-body text-text-secondary line-clamp-2">
            {collection.description}
          </p>
        )}
        {collection.productCount > 0 && (
          <p className="mt-3 text-caption text-text-muted">
            {collection.productCount} product{collection.productCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </Link>
  );
}
