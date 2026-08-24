/**
 * TestimonialsSection
 *
 * Customer testimonials carousel-style grid with ratings.
 * Content is sourced from the homepage service layer.
 * Uses Container, SectionHeader, Card, StarRating from the design system.
 */

import { Quote } from "lucide-react";
import { Container, SectionHeader, StarRating } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHomepageContent } from "@/hooks/homepage";
import { formatNumber } from "@/utils/formatters";

const RATING_SUMMARY = { average: 4.8, totalReviews: 12400 };

export default function TestimonialsSection() {
  const { data, isLoading } = useHomepageContent();

  return (
    <section className="bg-surface-0 py-10 sm:py-12">
      <Container>
        <SectionHeader
          title="What Our Customers Say"
          subtitle={`${formatNumber(RATING_SUMMARY.totalReviews)}+ verified reviews`}
          action={
            <div className="hidden items-center gap-2 rounded-xl border border-surface-200 bg-surface-0 px-4 py-2 shadow-xs sm:flex">
              <span className="text-xl font-bold text-surface-900">{RATING_SUMMARY.average}</span>
              <div>
                <StarRating value={RATING_SUMMARY.average} size={12} />
                <p className="text-[11px] text-surface-400">Average rating</p>
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
          {isLoading
            ? Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))
            : data?.testimonials.map((testimonial) => (
                <figure
                  key={testimonial.id}
                  className="flex h-full flex-col rounded-xl border border-surface-200 bg-surface-0 p-6 shadow-xs transition-shadow duration-normal ease-smooth hover:shadow-md"
                >
                  <Quote size={22} className="text-brand-300" aria-hidden="true" />
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-surface-700">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  <figcaption className="mt-5 flex items-center gap-3 border-t border-surface-100 pt-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700"
                      aria-hidden="true"
                    >
                      {testimonial.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-surface-900">
                        {testimonial.authorName}
                      </p>
                      <p className="text-xs text-surface-500">{testimonial.authorRole}</p>
                    </div>
                    <StarRating value={testimonial.rating} size={13} />
                  </figcaption>
                </figure>
              ))}
        </div>

        <p className="sr-only">
          Rated {RATING_SUMMARY.average} out of 5 stars by{" "}
          {formatNumber(RATING_SUMMARY.totalReviews)} customers.
        </p>
      </Container>
    </section>
  );
}
