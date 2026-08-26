import { useState, useMemo } from "react";
import {
  Copy,
  Bookmark,
  BookmarkCheck,
  Ticket,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Tag,
} from "lucide-react";
import { Container, Badge, Button, Input, Tabs, EmptyState } from "@/components/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks";
import { useCoupons, useSaveCoupon, useValidateCoupon } from "@/hooks";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { CouponStatus, Coupon } from "@/types/engagement";

const TAB_DEFINITIONS: { id: CouponStatus; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "expired", label: "Expired" },
];

const STATUS_VARIANTS: Record<CouponStatus, "success" | "info" | "warning" | "default"> = {
  available: "success",
  saved: "info",
  applied: "warning",
  expired: "default",
};

const STATUS_LABELS: Record<CouponStatus, string> = {
  available: "Available",
  saved: "Saved",
  applied: "Applied",
  expired: "Expired",
};

function formatCouponValue(type: Coupon["type"], value: number): string {
  return type === "percentage" ? `${value}%` : formatCurrency(value);
}

function formatCouponSubtitle(type: Coupon["type"]): string {
  return type === "percentage" ? "% off" : "$ off";
}

function isExpiringSoon(expiresOn: string): boolean {
  const now = new Date();
  const expiry = new Date(expiresOn);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

function CouponCard({
  coupon,
  onSaveToggle,
  isSaving,
}: {
  coupon: Coupon;
  onSaveToggle: (id: string) => void;
  isSaving: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiringSoon = coupon.status !== "expired" && isExpiringSoon(coupon.expiresOn);

  return (
    <div className="relative overflow-hidden rounded-xl border border-surface-200 bg-surface-0 transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="flex w-full shrink-0 items-center justify-center bg-brand-50 px-6 py-6 sm:w-36 sm:py-8">
          <div className="text-center">
            <span className="block text-2xl font-extrabold text-brand-700 sm:text-3xl">
              {formatCouponValue(coupon.type, coupon.value)}
            </span>
            <span className="mt-0.5 block text-xs font-medium text-brand-500">
              {formatCouponSubtitle(coupon.type)}
            </span>
          </div>
        </div>

        <div className="hidden w-px self-stretch border-r border-dashed border-surface-300 sm:block" />

        <div className="flex-1 px-5 py-4 sm:border-t-0 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-surface-900">{coupon.title}</h3>
              <p className="mt-0.5 text-xs text-surface-500 line-clamp-2">{coupon.description}</p>
            </div>
            <Badge variant={STATUS_VARIANTS[coupon.status]}>
              {STATUS_LABELS[coupon.status]}
            </Badge>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-surface-300 bg-surface-50 px-2.5 py-1">
              <Tag size={12} className="text-surface-400" />
              <span className="text-xs font-bold tracking-wider text-surface-800 uppercase">
                {coupon.code}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <CheckCircle size={12} className="mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={12} className="mr-1" />
                  Copy Code
                </>
              )}
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-500">
            {coupon.minimumOrderAmount !== undefined && (
              <span>Min. order {formatCurrency(coupon.minimumOrderAmount)}</span>
            )}
            <span>
              Expires {formatDate(coupon.expiresOn)}
            </span>
            {coupon.usageLimit !== undefined ? (
              <span>
                {coupon.usageCount} / {coupon.usageLimit} used
              </span>
            ) : (
              <span>Used {coupon.usageCount} time{coupon.usageCount !== 1 ? "s" : ""}</span>
            )}
          </div>

          {expiringSoon && (
            <div className="mt-2 flex items-center gap-1 text-xs text-warning-700">
              <AlertTriangle size={12} />
              Expiring soon!
            </div>
          )}

          {coupon.appliedToOrder && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-800">
              Applied to {coupon.appliedToOrder}
            </div>
          )}
        </div>
      </div>

      {(coupon.status === "available" || coupon.status === "saved") && (
        <>
          <div className="border-t border-dashed border-surface-200" />
          <div className="flex items-center justify-end gap-2 px-5 py-3 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSaveToggle(coupon.id)}
              disabled={isSaving}
            >
              {coupon.saved ? (
                <>
                  <BookmarkCheck size={14} className="mr-1 text-brand-600" />
                  Unsave
                </>
              ) : (
                <>
                  <Bookmark size={14} className="mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function CouponsPage() {
  usePageTitle("My Coupons");

  const [activeTab, setActiveTab] = useState<CouponStatus>("available");
  const [codeInput, setCodeInput] = useState("");

  const { data: availableCoupons, isLoading: loadingAvailable } = useCoupons("available");
  const { data: savedCoupons, isLoading: loadingSaved } = useCoupons("saved");
  const { data: appliedCoupons, isLoading: loadingApplied } = useCoupons("applied");
  const { data: expiredCoupons, isLoading: loadingExpired } = useCoupons("expired");

  const allData = useMemo(
    () => ({
      available: availableCoupons ?? [],
      saved: savedCoupons ?? [],
      applied: appliedCoupons ?? [],
      expired: expiredCoupons ?? [],
    }),
    [availableCoupons, savedCoupons, appliedCoupons, expiredCoupons],
  );

  const counts = useMemo(
    () => ({
      available: allData.available.length,
      saved: allData.saved.length,
      applied: allData.applied.length,
      expired: allData.expired.length,
    }),
    [allData],
  );

  const tabs = useMemo(
    () =>
      TAB_DEFINITIONS.map((tab) => ({
        id: tab.id,
        label: tab.label,
        count: counts[tab.id],
      })),
    [counts],
  );

  const saveMutation = useSaveCoupon();
  const validateMutation = useValidateCoupon();

  const handleValidate = () => {
    const trimmed = codeInput.trim();
    if (!trimmed) return;
    validateMutation.mutate(trimmed, {
      onSuccess: () => {
        setCodeInput("");
      },
    });
  };

  const currentData = allData[activeTab];
  const isCurrentLoading =
    (activeTab === "available" && loadingAvailable) ||
    (activeTab === "saved" && loadingSaved) ||
    (activeTab === "applied" && loadingApplied) ||
    (activeTab === "expired" && loadingExpired);

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "My Coupons" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            My Coupons
          </h1>
        </header>

        <div className="mt-6 max-w-3xl space-y-6">
          <Card>
            <CardBody>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-surface-700">
                    Have a code?
                  </label>
                  <Input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="Enter coupon code"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleValidate();
                    }}
                  />
                </div>
                <div className="flex flex-col items-end gap-1 pt-1">
                  <Button
                    onClick={handleValidate}
                    disabled={validateMutation.isPending || !codeInput.trim()}
                  >
                    {validateMutation.isPending ? "Validating..." : "Validate"}
                  </Button>
                </div>
              </div>

              {validateMutation.isSuccess && (
                <div className="mt-3 flex items-center gap-1.5 rounded-md bg-success-50 px-3 py-2 text-sm text-success-800">
                  <CheckCircle size={14} />
                  Coupon validated and added to your account!
                </div>
              )}

              {validateMutation.isError && (
                <div className="mt-3 flex items-center gap-1.5 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-800">
                  <XCircle size={14} />
                  {(validateMutation.error as Error).message || "Invalid coupon code."}
                </div>
              )}
            </CardBody>
          </Card>

          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as CouponStatus)}>
            {isCurrentLoading ? (
              <EmptyState
                title="Loading coupons..."
                description="Please wait while we fetch your coupons."
                action={<Ticket size={16} className="animate-pulse" />}
              />
            ) : currentData.length === 0 ? (
              <EmptyState
                title={
                  activeTab === "available"
                    ? "No available coupons"
                    : activeTab === "saved"
                      ? "No saved coupons"
                      : activeTab === "applied"
                        ? "No applied coupons"
                        : "No expired coupons"
                }
                description={
                  activeTab === "available"
                    ? "Check back later for new coupon codes or enter one above to validate."
                    : activeTab === "saved"
                      ? "Save coupons from the Available tab to access them quickly later."
                      : activeTab === "applied"
                        ? "Coupons you apply at checkout will show up here."
                        : "Your expired coupons will appear here for reference."
                }
                action={
                  activeTab === "available" ? (
                    <Ticket size={16} className="text-surface-300" />
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-4 pt-4">
                {currentData.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onSaveToggle={(id) => saveMutation.mutate(id)}
                    isSaving={saveMutation.isPending}
                  />
                ))}
              </div>
            )}
          </Tabs>
        </div>
      </Container>
    </div>
  );
}
