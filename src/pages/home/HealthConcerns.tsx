/**
 * HealthConcerns
 *
 * Shop-by-health-concern navigation tiles.
 * Content is sourced from the homepage service layer.
 * Uses Container, SectionHeader, IconTile from the design system.
 */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeader, IconTile, Skeleton } from "@/components/ui";
import { useHomepageContent } from "@/hooks/homepage";

export default function HealthConcerns() {
  const { data, isLoading } = useHomepageContent();

  return (
    <section className="bg-surface-0 py-10 sm:py-12">
      <Container>
        <SectionHeader
          title="Shop by Health Concern"
          subtitle="Targeted products for your specific needs"
          action={
            <Link
              to="/health-concerns"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors duration-fast hover:text-brand-700"
            >
              View All
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl sm:h-28" />
              ))
            : data?.healthConcerns.map((concern) => (
                <Link
                  key={concern.id}
                  to={concern.path}
                  className="group flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 p-3 shadow-xs transition-all duration-normal ease-smooth hover:border-brand-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:p-4"
                >
                  <IconTile
                    icon={<concern.icon size={20} aria-hidden="true" />}
                    size="sm"
                    color={concern.color}
                    className="transition-transform duration-normal ease-smooth group-hover:scale-110"
                  />
                  <span className="text-xs font-semibold leading-tight text-surface-800 group-hover:text-brand-700 sm:text-sm">
                    {concern.title}
                  </span>
                </Link>
              ))}
        </div>
      </Container>
    </section>
  );
}
