/**
 * HeroBanner
 *
 * Primary hero carousel with promotional slides.
 * Auto-advances with pause on hover/focus and respects prefers-reduced-motion.
 * Fully keyboard accessible with previous/next controls and dot indicators.
 * Content is sourced from the homepage service layer.
 */

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, ClipboardList, Sparkles } from "lucide-react";
import { Container, Skeleton } from "@/components/ui";
import { useHomepageContent } from "@/hooks/homepage";
import type { HeroSlide, HeroSlideTheme } from "@/types/homepage";
import { cn } from "@/utils/cn";

const AUTOPLAY_INTERVAL_MS = 6000;

const themeStyles: Record<HeroSlideTheme, string> = {
  brand: "bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800",
  blue: "bg-gradient-to-br from-info-600 via-blue-800 to-blue-950",
  purple: "bg-gradient-to-br from-purple-600 via-purple-800 to-surface-900",
  amber: "bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700",
};

const eyebrowStyles: Record<HeroSlideTheme, string> = {
  brand: "bg-brand-500/20 text-brand-100",
  blue: "bg-blue-500/20 text-blue-100",
  purple: "bg-purple-500/20 text-purple-100",
  amber: "bg-orange-500/25 text-amber-50",
};

export default function HeroBanner() {
  const { data, isLoading } = useHomepageContent();
  const slides = data?.heroSlides ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const count = slides.length;
  const clampedIndex = count > 0 ? Math.min(activeIndex, count - 1) : 0;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback(
    (index: number) => setActiveIndex(((index % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (isPaused || prefersReducedMotion || count <= 1) return;
    const timer = window.setInterval(
      () => setActiveIndex((i) => (i + 1) % count),
      AUTOPLAY_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion, count]);

  if (isLoading) return <HeroSkeleton />;

  if (count === 0) return null;

  return (
    <section
      className={cn("transition-colors duration-slow", themeStyles[slides[clampedIndex].theme])}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          goTo(e.key === "ArrowLeft" ? clampedIndex - 1 : clampedIndex + 1);
        }
      }}
    >
      {/* Single page-level heading; slide titles are visual only */}
      <h1 className="sr-only">KeeMeds — Your Trusted Healthcare Partner</h1>
      <Container className="relative py-10 sm:py-14 lg:py-16">
        {/* Slides */}
        <div
          className="relative overflow-hidden rounded-2xl"
          aria-live={isPaused ? "polite" : "off"}
        >
          {slides.map((slide, index) => (
            <HeroSlidePanel
              key={slide.id}
              slide={slide}
              isActive={index === clampedIndex}
              position={`${index + 1} of ${count}`}
            />
          ))}
        </div>

        {/* Controls */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(clampedIndex - 1)}
              className="absolute left-1 top-1/2 z-overlay hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors duration-fast hover:bg-white/30 focus-visible:bg-white/30 sm:flex"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => goTo(clampedIndex + 1)}
              className="absolute right-1 top-1/2 z-overlay hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors duration-fast hover:bg-white/30 focus-visible:bg-white/30 sm:flex"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>

            <div className="mt-5 flex justify-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-normal ease-smooth",
                    index === clampedIndex
                      ? "w-6 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/60",
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === clampedIndex}
                />
              ))}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

/* ── Slide Panel ── */

function HeroSlidePanel({
  slide,
  isActive,
  position,
}: {
  slide: HeroSlide;
  isActive: boolean;
  position: string;
}) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={position}
      aria-hidden={!isActive}
      className={cn(
        "grid items-center gap-8 px-2 py-4 transition-opacity duration-slow ease-smooth sm:px-6 lg:grid-cols-2 lg:px-10",
        isActive ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
      )}
    >
      <div className="space-y-5">
        <span
          className={cn(
            "inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider",
            eyebrowStyles[slide.theme],
          )}
        >
          {slide.eyebrow}
        </span>
        <p className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
          {renderTitle(slide.title, slide.highlight)}
        </p>
        <p className="max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
          {slide.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to={slide.primaryCta.path}
            tabIndex={isActive ? 0 : -1}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-2.5 text-base font-semibold text-surface-900 shadow-md transition-colors duration-fast hover:bg-surface-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            {slide.primaryCta.label}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          {slide.secondaryCta && (
            <Link
              to={slide.secondaryCta.path}
              tabIndex={isActive ? 0 : -1}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 px-6 py-2.5 text-base font-semibold text-white transition-colors duration-fast hover:border-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              <ClipboardList size={18} aria-hidden="true" />
              {slide.secondaryCta.label}
            </Link>
          )}
        </div>
      </div>

      {/* Decorative Visual */}
      <div className="hidden lg:flex" aria-hidden="true">
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles size={28} className="text-white" />
          </div>
          <p className="max-w-[12rem] text-center text-sm font-medium leading-snug text-white/80">
            {slide.eyebrow}
          </p>
        </div>
      </div>
    </div>
  );
}

function renderTitle(title: string, highlight?: string): ReactNode {
  if (!highlight || !title.includes(highlight)) return title;

  const [before, after] = title.split(highlight);
  return (
    <>
      {before}
      <span className="underline decoration-4 underline-offset-8">{highlight}</span>
      {after}
    </>
  );
}

/* ── Loading State ── */

function HeroSkeleton() {
  return (
    <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800" aria-hidden="true">
      <Container className="py-10 sm:py-14 lg:py-16">
        <div className="grid items-center gap-8 px-2 py-4 sm:px-6 lg:grid-cols-2 lg:px-10">
          <div className="space-y-5">
            <Skeleton className="h-7 w-48 rounded-full bg-white/20" />
            <Skeleton className="h-12 w-full max-w-xl bg-white/20" />
            <Skeleton className="h-4 w-full max-w-lg bg-white/20" />
            <Skeleton className="h-4 w-3/4 max-w-md bg-white/20" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-11 w-36 bg-white/20" />
              <Skeleton className="h-11 w-44 bg-white/20" />
            </div>
          </div>
          <div className="hidden lg:block">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl bg-white/10" />
          </div>
        </div>
      </Container>
    </section>
  );
}
