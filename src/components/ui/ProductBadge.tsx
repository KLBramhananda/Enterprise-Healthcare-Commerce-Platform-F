/**
 * ProductBadge
 *
 * Compact badge overlay for product cards.
 * Renders a single badge with style derived from `BADGE_STYLES`.
 */

import type { ProductBadgeType } from "@/types/catalog";
import { BADGE_STYLES } from "@/config/constants";

interface ProductBadgeProps {
  type: ProductBadgeType;
  label: string;
}

export function ProductBadge({ type, label }: ProductBadgeProps) {
  const config = BADGE_STYLES[type];
  if (!config) return null;

  return (
    <span
      className={config.className}
      aria-label={label}
    >
      {label}
    </span>
  );
}
