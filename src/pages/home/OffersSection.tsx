/**
 * OffersSection
 *
 * Offers and promotions cards with copyable coupon codes.
 * Content is sourced from the homepage service layer.
 * Uses Container, SectionHeader from the design system.
 */

import { Check, Copy, TicketPercent } from "lucide-react";
import { useState } from "react";
import { Container, SectionHeader, Skeleton } from "@/components/ui";
import { useHomepageContent } from "@/hooks/homepage";
import type { Offer } from "@/types/homepage";
import { formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const accentStyles: Record<Offer["accent"], { border: string; chip: string; code: string }> = {
  brand: {
    border: "border-l-brand-500 hover:border-brand-200",
    chip: "bg-brand-50 text-brand-700",
    code: "border-brand-300 text-brand-700",
  },
  blue: {
    border: "border-l-blue-500 hover:border-blue-200",
    chip: "bg-blue-50 text-blue-700",
    code: "border-blue-300 text-blue-700",
  },
  amber: {
    border: "border-l-amber-500 hover:border-amber-200",
    chip: "bg-amber-50 text-amber-700",
    code: "border-amber-300 text-amber-700",
  },
  pink: {
    border: "border-l-pink-500 hover:border-pink-200",
    chip: "bg-pink-50 text-pink-700",
    code: "border-pink-300 text-pink-700",
  },
};

export default function OffersSection() {
  const { data, isLoading } = useHomepageContent();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (offer: Offer) => {
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopiedId(offer.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* Clipboard unavailable — the code remains visible for manual entry. */
    }
  };

  return (
    <section className="bg-surface-0 py-10 sm:py-12">
      <Container>
        <SectionHeader
          title="Offers & Promotions"
          subtitle="Save more on every order"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {isLoading
            ? Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))
            : data?.offers.map((offer) => {
                const accent = accentStyles[offer.accent];
                return (
                  <article
                    key={offer.id}
                    className={cn(
                      "flex flex-col rounded-xl border border-l-4 border-surface-200 bg-surface-0 p-5 shadow-xs transition-shadow duration-normal ease-smooth hover:shadow-md",
                      accent.border,
                    )}
                    aria-label={`Offer ${offer.title}, code ${offer.code}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-100">
                        <TicketPercent size={18} className="text-brand-600" aria-hidden="true" />
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider",
                          accent.chip,
                        )}
                      >
                        Coupon
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-semibold text-surface-900">
                      {offer.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-surface-600">
                      {offer.description}
                    </p>

                    <div className="mt-auto space-y-3 pt-4">
                      <button
                        type="button"
                        onClick={() => handleCopy(offer)}
                        className={cn(
                          "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 font-mono text-sm font-bold tracking-widest transition-colors duration-fast",
                          accent.code,
                          "hover:bg-surface-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
                        )}
                        aria-live="polite"
                      >
                        {copiedId === offer.id ? (
                          <>
                            <Check size={14} aria-hidden="true" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} aria-hidden="true" /> {offer.code}
                          </>
                        )}
                      </button>
                      <p className="text-[11px] leading-relaxed text-surface-400">
                        {offer.terms} &middot; Valid till {formatDate(offer.expiresOn)}
                      </p>
                    </div>
                  </article>
                );
              })}
        </div>
      </Container>
    </section>
  );
}
