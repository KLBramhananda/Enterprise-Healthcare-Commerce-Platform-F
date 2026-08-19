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
    <nav className={cn("flex items-center gap-1 text-sm text-slate-500", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.label} className="flex items-center gap-1">
            {index > 0 && <ChevronRight size={12} className="text-slate-400" />}
            {item.path && !isLast ? (
              <Link to={item.path} className="text-slate-500 hover:text-emerald-600">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-slate-900" : ""}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
