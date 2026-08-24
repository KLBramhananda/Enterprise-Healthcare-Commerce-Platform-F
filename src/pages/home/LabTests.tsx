/**
 * PopularLabTests
 *
 * Popular lab test cards with pricing and booking CTA.
 * Content is sourced from the homepage service layer.
 * Uses Container, SectionHeader from the design system.
 */

import { FlaskConical, Microscope, Timer, UtensilsCrossed } from "lucide-react";
import { Container, SectionHeader, Skeleton } from "@/components/ui";
import { useHomepageContent } from "@/hooks/homepage";
import type { LabTest } from "@/types/homepage";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/utils/cn";

export default function PopularLabTests() {
  const { data, isLoading } = useHomepageContent();

  return (
    <section className="bg-surface-50 py-10 sm:py-12">
      <Container>
        <SectionHeader
          title="Popular Lab Tests"
          subtitle="Certified labs, free home sample collection"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))
            : data?.labTests.map((test) => <LabTestCard key={test.id} test={test} />)}
        </div>
      </Container>
    </section>
  );
}

function LabTestCard({ test }: { test: LabTest }) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border bg-surface-0 p-5 shadow-xs transition-all duration-normal ease-smooth hover:shadow-md",
        test.popular
          ? "border-brand-300 ring-1 ring-brand-100"
          : "border-surface-200 hover:border-brand-200",
      )}
      aria-label={`${test.name}, ${formatCurrency(test.price)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
          <FlaskConical size={18} aria-hidden="true" />
        </div>
        {test.popular && (
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
            Popular
          </span>
        )}
      </div>

      <h3 className="mt-3 text-sm font-semibold leading-snug text-surface-900 sm:text-base">
        {test.name}
      </h3>

      <ul className="mt-3 space-y-1.5 text-xs text-surface-500">
        <li className="flex items-center gap-1.5">
          <Microscope size={12} className="shrink-0 text-surface-400" aria-hidden="true" />
          Includes {test.parameterCount} parameter{test.parameterCount !== 1 ? "s" : ""}
        </li>
        <li className="flex items-center gap-1.5">
          <Timer size={12} className="shrink-0 text-surface-400" aria-hidden="true" />
          Reports in {test.reportInDays} day{test.reportInDays !== 1 ? "s" : ""}
        </li>
        <li className="flex items-center gap-1.5">
          <UtensilsCrossed size={12} className="shrink-0 text-surface-400" aria-hidden="true" />
          {test.fastingRequired ? "Fasting required" : "No fasting required"}
        </li>
      </ul>

      <div className="mt-auto flex items-end justify-between pt-4">
        <div className="flex flex-col">
          <span className="text-base font-bold text-brand-700">{formatCurrency(test.price)}</span>
          {test.originalPrice != null && (
            <span className="text-xs text-surface-400 line-through">
              {formatCurrency(test.originalPrice)}
              {test.discountPercent != null && ` (${test.discountPercent}% off)`}
            </span>
          )}
        </div>
        <button
          type="button"
          className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-fast hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Book Now
        </button>
      </div>
    </article>
  );
}
