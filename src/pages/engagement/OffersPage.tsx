import { useState, useMemo } from "react";
import {
  Tag,
  Clock,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Users,
  ShoppingCart,
} from "lucide-react";
import { Container, Badge, Button, EmptyState, Tabs } from "@/components/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useOffers, useSaveOffer } from "@/hooks/engagement";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Offer, OfferStatus } from "@/types/engagement";

const TAB_CONFIG: { id: OfferStatus | "all"; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "expired", label: "Expired" },
];

const STATUS_BADGE: Record<OfferStatus, { variant: "success" | "info" | "default"; text: string }> = {
  active: { variant: "success", text: "Active" },
  upcoming: { variant: "info", text: "Upcoming" },
  expired: { variant: "default", text: "Expired" },
};

const ACCENT_BORDER: Record<string, string> = {
  brand: "border-t-brand-500",
  blue: "border-t-info-500",
  amber: "border-t-warning-400",
  pink: "border-t-danger-300",
  green: "border-t-success-500",
};

function formatDiscount(offer: Offer): string {
  if (offer.discountPercent != null) {
    return `${offer.discountPercent}% OFF`;
  }
  if (offer.discountAmount != null) {
    return `${formatCurrency(offer.discountAmount)} OFF`;
  }
  return "Special Offer";
}

function formatRedemptionCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

export default function OffersPage() {
  usePageTitle("Offers & Deals");

  const { data: allOffers, isLoading } = useOffers();
  const saveOffer = useSaveOffer();

  const [activeTab, setActiveTab] = useState<OfferStatus | "all">("active");
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const offers = useMemo(() => allOffers ?? [], [allOffers]);

  const statusCounts = useMemo(() => {
    const counts: Record<OfferStatus, number> = { active: 0, upcoming: 0, expired: 0 };
    offers.forEach((o) => {
      counts[o.status] += 1;
    });
    return counts;
  }, [offers]);

  const tabs = useMemo(
    () =>
      TAB_CONFIG.map((tab) => ({
        id: tab.id,
        label: tab.label,
        count: tab.id === "all" ? offers.length : statusCounts[tab.id as OfferStatus],
      })),
    [statusCounts, offers.length],
  );

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => o.status === activeTab);
  }, [offers, activeTab]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // fallback
    }
  };

  const toggleTerms = (id: string) => {
    setExpandedTerms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Offers" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            Offers &amp; Deals
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Browse exclusive discounts, promo codes, and limited-time deals.
          </p>
        </header>

        <div className="mt-6">
          {isLoading ? (
            <EmptyState
              title="Loading offers..."
              description="Please wait while we fetch the latest deals."
              action={<Clock size={16} className="animate-spin" />}
            />
          ) : (
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as OfferStatus | "all")}>
              {filteredOffers.length === 0 ? (
                <EmptyState
                  title={`No ${activeTab} offers`}
                  description={
                    activeTab === "active"
                      ? "There are no active offers right now. Check back soon!"
                      : activeTab === "upcoming"
                        ? "No upcoming offers at the moment. Stay tuned!"
                        : "No expired offers to display."
                  }
                />
              ) : (
                <div className="grid gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredOffers.map((offer) => {
                    const statusInfo = STATUS_BADGE[offer.status];
                    const isTermsExpanded = expandedTerms[offer.id] ?? false;
                    const isCopied = copiedCode === offer.code;

                    return (
                      <Card
                        key={offer.id}
                        className={`border-t-4 ${ACCENT_BORDER[offer.accent] ?? "border-t-brand-500"} overflow-hidden transition-all hover:shadow-md`}
                      >
                        <CardBody className="flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                            <span className="text-lg font-extrabold text-brand-600">
                              {formatDiscount(offer)}
                            </span>
                          </div>

                          <h3 className="text-base font-semibold text-surface-900">
                            {offer.title}
                          </h3>

                          <p className="text-sm text-surface-500 line-clamp-2">
                            {offer.description}
                          </p>

                          {offer.targetLabel && (
                            <div className="flex items-center gap-1.5 text-xs text-surface-500">
                              <Tag size={12} className="text-surface-400" />
                              {offer.targetLabel}
                            </div>
                          )}

                          {offer.minimumOrderAmount != null && offer.minimumOrderAmount > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-surface-500">
                              <ShoppingCart size={12} className="text-surface-400" />
                              Min. order: {formatCurrency(offer.minimumOrderAmount)}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-xs text-surface-400">
                            <Clock size={12} />
                            {offer.status === "active"
                              ? `Expires ${formatDate(offer.endDate)}`
                              : offer.status === "upcoming"
                                ? `Starts ${formatDate(offer.startDate)}`
                                : `Expired ${formatDate(offer.endDate)}`}
                          </div>

                          {offer.terms && (
                            <div className="rounded-lg bg-surface-50 p-2.5">
                              <p className={`text-xs text-surface-500 ${isTermsExpanded ? "" : "line-clamp-2"}`}>
                                {offer.terms}
                              </p>
                              <button
                                type="button"
                                onClick={() => toggleTerms(offer.id)}
                                className="mt-1 flex items-center gap-0.5 text-xs font-medium text-brand-600 hover:text-brand-700"
                              >
                                {isTermsExpanded ? (
                                  <>
                                    Less <ChevronUp size={12} />
                                  </>
                                ) : (
                                  <>
                                    Terms &amp; conditions <ChevronDown size={12} />
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-xs text-surface-400">
                            <Users size={12} />
                            {formatRedemptionCount(offer.redemptionCount)} redemptions
                          </div>

                          <div className="mt-auto flex items-center gap-2 pt-2">
                            <Button
                              variant={isCopied ? "ghost" : "primary"}
                              size="sm"
                              className="flex-1"
                              onClick={() => handleCopyCode(offer.code)}
                            >
                              {isCopied ? (
                                <>
                                  <Check size={14} className="mr-1" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={14} className="mr-1" />
                                  Copy Code
                                </>
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveOffer.mutate(offer.id)}
                              disabled={saveOffer.isPending}
                            >
                              {offer.saved ? (
                                <BookmarkCheck size={16} className="text-brand-600" />
                              ) : (
                                <Bookmark size={16} className="text-surface-500" />
                              )}
                            </Button>
                          </div>

                          <div className="rounded-lg border border-dashed border-surface-300 bg-surface-50 py-2 text-center">
                            <span className="font-mono text-sm font-bold tracking-wider text-surface-700">
                              {offer.code}
                            </span>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Tabs>
          )}
        </div>
      </Container>
    </div>
  );
}
