import {
  Crown,
  Check,
  X,
  ArrowRight,
  Star,
  Truck,
  Headphones,
  Gift,
  Cake,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Container, Card, CardBody, Badge, Button, LinearProgress } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useMembershipStatus } from "@/hooks/engagement/useMembership";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { MembershipTierName, MembershipTier } from "@/types/engagement";

const TIER_COLORS: Record<MembershipTierName, { bg: string; text: string; border: string; ring: string; badge: "info" | "warning" | "success" | "danger" }> = {
  Silver: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", ring: "ring-slate-200", badge: "info" },
  Gold: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", ring: "ring-amber-200", badge: "warning" },
  Platinum: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300", ring: "ring-indigo-200", badge: "success" },
  Diamond: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300", ring: "ring-cyan-200", badge: "danger" },
};

const TIER_ORDER: MembershipTierName[] = ["Silver", "Gold", "Platinum", "Diamond"];

const BENEFIT_ROWS: { label: string; key: keyof MembershipTier; format: (tier: MembershipTier) => string | boolean }[] = [
  { label: "Order Discount", key: "discountPercent", format: (t) => `${t.discountPercent}%` },
  { label: "Loyalty Multiplier", key: "loyaltyMultiplier", format: (t) => `${t.loyaltyMultiplier}x` },
  { label: "Free Shipping", key: "freeShipping", format: (t) => t.freeShipping },
  { label: "Priority Support", key: "prioritySupport", format: (t) => t.prioritySupport },
  { label: "Exclusive Offers", key: "exclusiveOffers", format: (t) => t.exclusiveOffers },
  { label: "Birthday Bonus", key: "birthdayBonus", format: (t) => t.birthdayBonus > 0 ? `${formatCurrency(t.birthdayBonus)} points` : false },
];

function CheckIcon({ value }: { value: boolean }) {
  return value ? (
    <Check size={18} className="mx-auto text-success-600" />
  ) : (
    <X size={18} className="mx-auto text-surface-300" />
  );
}

export default function MembershipPage() {
  usePageTitle("Membership");

  const { data: status, isLoading: statusLoading } = useMembershipStatus();

  if (statusLoading) {
    return (
      <div className="bg-surface-50 pb-12">
        <Container>
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        </Container>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-surface-50 pb-12">
        <Container>
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Membership" },
            ]}
          />
          <div className="mt-12 text-center text-surface-500">
            <p>Membership information is currently unavailable.</p>
          </div>
        </Container>
      </div>
    );
  }

  const { currentTier, currentSpend, nextTier, spendToNextTier, memberSince, allTiers } = status;
  const currentTierData = allTiers.find((t) => t.name === currentTier);
  const nextTierData = nextTier ? allTiers.find((t) => t.name === nextTier) : undefined;
  const currentTierColor = TIER_COLORS[currentTier];
  const progressPercent = nextTierData
    ? Math.min(100, Math.round((currentSpend / nextTierData.minSpend) * 100))
    : 100;

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Membership" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            Membership
          </h1>
        </header>

        <div className="mt-8">
          <Card className={`border-2 ${currentTierColor.border} ring-1 ${currentTierColor.ring}`}>
            <CardBody className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${currentTierColor.bg}`}>
                    <Crown size={32} className={currentTierColor.text} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className={`text-2xl font-bold ${currentTierColor.text}`}>{currentTier}</h2>
                      <Badge variant={currentTierColor.badge}>Current Tier</Badge>
                    </div>
                    <p className="mt-1 text-sm text-surface-500">
                      Member since {formatDate(memberSince)}
                    </p>
                    <p className="text-sm text-surface-700">
                      Lifetime spend: <span className="font-semibold">{formatCurrency(currentSpend)}</span>
                    </p>
                  </div>
                </div>

                {currentTierData && (
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 rounded-lg bg-surface-50 px-3 py-2 text-sm">
                      <ShoppingCart size={14} className="text-surface-400" />
                      <span className="text-surface-600">{currentTierData.discountPercent}% off</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-surface-50 px-3 py-2 text-sm">
                      <Star size={14} className="text-surface-400" />
                      <span className="text-surface-600">{currentTierData.loyaltyMultiplier}x points</span>
                    </div>
                    {currentTierData.freeShipping && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-surface-50 px-3 py-2 text-sm">
                        <Truck size={14} className="text-surface-400" />
                        <span className="text-surface-600">Free shipping</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {nextTier && nextTierData && spendToNextTier !== undefined && (
                <div className="mt-6 rounded-xl bg-surface-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-600">
                      Spend <span className="font-semibold text-surface-900">{formatCurrency(spendToNextTier)}</span> more to reach{" "}
                      <span className={`font-semibold ${TIER_COLORS[nextTier].text}`}>{nextTier}</span>
                    </span>
                    <span className="font-semibold text-surface-900">{progressPercent}%</span>
                  </div>
                  <div className="mt-3">
                    <LinearProgress value={progressPercent} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-surface-500">
                    <span>{formatCurrency(currentSpend)}</span>
                    <span>{formatCurrency(nextTierData.minSpend)}</span>
                  </div>
                </div>
              )}

              {!nextTier && (
                <div className="mt-6 rounded-xl bg-surface-50 p-4 text-center">
                  <p className="text-sm font-semibold text-surface-900">
                    You have reached the highest membership tier!
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-surface-900">Compare Tiers</h2>
          <p className="mt-1 text-sm text-surface-500">See what benefits each tier unlocks.</p>

          <div className="mt-6 overflow-x-auto pb-2">
            <div className="grid min-w-[640px] grid-cols-4 gap-4">
              {allTiers.map((tier) => {
                const tc = TIER_COLORS[tier.name];
                const isCurrent = tier.name === currentTier;

                return (
                  <div
                    key={tier.name}
                    className={`rounded-xl border-2 bg-surface-0 p-4 transition-all ${
                      isCurrent ? `${tc.border} shadow-lg ring-1 ${tc.ring}` : "border-surface-200"
                    }`}
                  >
                    <div className="text-center">
                      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${tc.bg}`}>
                        <Crown size={24} className={tc.text} />
                      </div>
                      <h3 className={`mt-2 text-lg font-bold ${tc.text}`}>{tier.name}</h3>
                      <p className="text-xs text-surface-500">
                        Min. spend {formatCurrency(tier.minSpend)}
                      </p>
                      {isCurrent && (
                        <Badge variant={tc.badge} className="mt-2">
                          Your Tier
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-surface-900">{tier.discountPercent}%</p>
                        <p className="text-xs text-surface-500">Discount</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-surface-900">{tier.loyaltyMultiplier}x</p>
                        <p className="text-xs text-surface-500">Loyalty Multiplier</p>
                      </div>

                      <div className="border-t border-surface-100 pt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-surface-600">
                            <Truck size={14} />
                            Free Shipping
                          </span>
                          <CheckIcon value={tier.freeShipping} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-surface-600">
                            <Headphones size={14} />
                            Priority Support
                          </span>
                          <CheckIcon value={tier.prioritySupport} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-surface-600">
                            <Gift size={14} />
                            Exclusive Offers
                          </span>
                          <CheckIcon value={tier.exclusiveOffers} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-surface-600">
                            <Cake size={14} />
                            Birthday Bonus
                          </span>
                          {tier.birthdayBonus > 0 ? (
                            <span className="text-sm font-medium text-surface-900">
                              {formatCurrency(tier.birthdayBonus)} pts
                            </span>
                          ) : (
                            <X size={18} className="mx-auto text-surface-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {allTiers.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold tracking-tight text-surface-900">Benefits Detail</h2>
            <p className="mt-1 text-sm text-surface-500">A detailed look at what each tier offers.</p>

            <div className="mt-6 overflow-x-auto pb-2">
              <table className="min-w-[640px] w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="pb-3 text-left font-semibold text-surface-900">Benefit</th>
                    {TIER_ORDER.map((tierName) => {
                      const tc = TIER_COLORS[tierName];
                      const isCurrent = tierName === currentTier;
                      return (
                        <th
                          key={tierName}
                          className={`pb-3 text-center font-semibold ${isCurrent ? tc.text : "text-surface-900"}`}
                        >
                          {tierName}
                          {isCurrent && (
                            <span className="ml-1 text-xs text-surface-500">(You)</span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {BENEFIT_ROWS.map((row, idx) => (
                    <tr
                      key={row.key}
                      className={idx % 2 === 0 ? "bg-surface-50" : ""}
                    >
                      <td className="px-4 py-3 font-medium text-surface-700">{row.label}</td>
                      {TIER_ORDER.map((tierName) => {
                        const tier = allTiers.find((t) => t.name === tierName)!;
                        const val = row.format(tier);
                        const isCurrent = tierName === currentTier;
                        return (
                          <td
                            key={tierName}
                            className={`px-4 py-3 text-center ${isCurrent ? "bg-brand-50/50 font-semibold" : ""}`}
                          >
                            {typeof val === "boolean" ? (
                              <CheckIcon value={val} />
                            ) : (
                              <span className="text-surface-900">{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {nextTier && (
          <div className="mt-10">
            <Card className="bg-brand-600 text-white">
              <CardBody className="p-6 text-center sm:p-8">
                <TrendingUp size={32} className="mx-auto text-brand-200" />
                <h2 className="mt-3 text-lg font-bold">Ready to level up?</h2>
                <p className="mt-1 text-sm text-brand-200">
                  Spend {formatCurrency(spendToNextTier ?? 0)} more to unlock{" "}
                  <span className="font-semibold">{nextTier}</span> benefits.
                </p>
                <Button variant="secondary" className="mt-4 bg-white text-brand-600 hover:bg-brand-50">
                  Start Shopping <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </CardBody>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
}
