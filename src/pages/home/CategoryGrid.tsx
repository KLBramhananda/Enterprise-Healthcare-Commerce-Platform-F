/**
 * CategoryGrid
 *
 * Featured category navigation with visual tiles.
 * Content is sourced from the homepage service layer.
 * Uses Container, SectionHeader, IconTile from the design system.
 */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeader, IconTile, Skeleton } from "@/components/ui";
import { useHomepageContent } from "@/hooks/homepage";

export default function CategoryGrid() {
  const { data, isLoading } = useHomepageContent();

  return (
    <section className="bg-surface-50 py-10 sm:py-12">
      <Container>
        <SectionHeader
          title="Shop by Category"
          subtitle="Everything your family needs, organized for you"
          action={
            <Link
              to="/categories"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors duration-fast hover:text-brand-700"
            >
              View All
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        />

        <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-8">
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-12 w-12 rounded-xl sm:h-14 sm:w-14" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))
            : data?.categories.map((category) => (
                <Link
                  key={category.id}
                  to={category.path}
                  className="group flex flex-col items-center gap-2 rounded-xl p-2 transition-colors duration-normal ease-smooth hover:bg-surface-50 focus-visible:bg-surface-50 focus:outline-none sm:p-3"
                >
                  <IconTile
                    icon={<category.icon size={22} aria-hidden="true" />}
                    size="md"
                    color={category.color}
                    className="transition-transform duration-normal ease-smooth group-hover:scale-110"
                  />
                  <span className="text-center text-[11px] font-medium leading-tight text-surface-700 group-hover:text-brand-700 sm:text-xs">
                    {category.title}
                  </span>
                </Link>
              ))}
        </div>
      </Container>
    </section>
  );
}
