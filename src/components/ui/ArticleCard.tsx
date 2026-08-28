/**
 * ArticleCard
 *
 * Reusable card for displaying health tips, blog posts, and editorial content.
 */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface ArticleCardProps {
  category: string;
  title: string;
  image?: ReactNode;
  href?: string;
  className?: string;
}

export default function ArticleCard({
  category,
  title,
  image,
  href,
  className,
}: ArticleCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-xl border border-surface-200 bg-surface-0",
        "transition-all duration-normal ease-smooth",
        "hover:border-brand-200 hover:shadow-md",
        className,
      )}
    >
      {/* Image Area */}
      <Link
        to={href ?? "#"}
        className="block"
        tabIndex={href ? undefined : -1}
        aria-hidden={!href}
      >
        <div className="flex aspect-[16/9] items-center justify-center border-b border-surface-100 bg-surface-50">
          {image ?? <span className="text-xs text-surface-400">Image</span>}
        </div>
      </Link>

      <div className="p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          {category}
        </span>
        <h3 className="mt-2 text-base font-semibold text-surface-900 transition-colors duration-normal group-hover:text-brand-700">
          <Link to={href ?? "#"} tabIndex={href ? undefined : -1} aria-hidden={!href} className="hover:underline">
            {title}
          </Link>
        </h3>
        <div className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600">
          <Link to={href ?? "#"} tabIndex={href ? undefined : -1} aria-hidden={!href}>
            <span>Read more</span>
          </Link>
          <ArrowRight
            size={14}
            className="transition-transform duration-normal group-hover:translate-x-1"
          />
        </div>
      </div>
    </article>
  );
}
