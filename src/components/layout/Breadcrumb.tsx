/**
 * Breadcrumb
 *
 * Reusable breadcrumb navigation component.
 */

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-surface-500", className)}>
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center gap-1">
              {index > 0 && <ChevronRight size={12} className="text-surface-400" aria-hidden="true" />}
              {item.path && !isLast ? (
                <Link to={item.path} className="text-surface-500 transition-colors duration-fast hover:text-brand-600">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-surface-900" : ""} aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
