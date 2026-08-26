import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Clock,
  RotateCcw,
  Sparkles,
  Gift,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Container, Card, CardBody, Badge, Button, Modal, Input, LinearProgress } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useLoyaltyAccount, useLoyaltyHistory, useLoyaltyTiers, useRedeemPoints } from "@/hooks/engagement/useLoyalty";
import { formatDate } from "@/utils/formatters";
import type { LoyaltyTransactionType } from "@/types/engagement";

const TX_CONFIG: Record<
  LoyaltyTransactionType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  earned: {
    icon: <ArrowUp size={16} />,
    color: "text-success-600",
    label: "Earned",
  },
  redeemed: {
    icon: <ArrowDown size={16} />,
    color: "text-warning-600",
    label: "Redeemed",
  },
  expired: {
    icon: <Clock size={16} />,
    color: "text-danger-600",
    label: "Expired",
  },
  adjusted: {
    icon: <RotateCcw size={16} />,
    color: "text-info-600",
    label: "Adjusted",
  },
};

function formatPoints(points: number, showSign = true): string {
  const abs = Math.abs(points).toLocaleString();
  if (!showSign) return abs;
  return points >= 0 ? `+${abs}` : `-${abs}`;
}

function pointsClass(points: number): string {
  if (points > 0) return "text-success-600";
  if (points < 0) return "text-danger-600";
  return "text-surface-500";
}

export default function LoyaltyPage() {
  usePageTitle("Loyalty Points");

  const { data: account, isLoading: accountLoading } = useLoyaltyAccount();
  const { data: transactions, isLoading: historyLoading } = useLoyaltyHistory();
  const { data: tiers } = useLoyaltyTiers();
  const redeemPoints = useRedeemPoints();

  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemError, setRedeemError] = useState("");

  const sortedTransactions = [...(transactions ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const currentTierIndex = tiers
    ? tiers.findIndex((t) => t.level === account?.tierLevel) ?? 0
    : 0;

  const currentTier = tiers?.[currentTierIndex];
  const nextTier = tiers?.[currentTierIndex + 1];

  const tierProgress = currentTier && nextTier && account
    ? ((account.lifetimePoints - currentTier.minPoints) /
        (nextTier.minPoints - currentTier.minPoints)) *
      100
    : account?.tierLevel === (tiers?.length ?? 0) - 1
    ? 100
    : 0;

  const handleRedeem = () => {
    const amount = parseInt(redeemAmount, 10);
    if (!amount || amount <= 0) {
      setRedeemError("Enter a valid number of points.");
      return;
    }
    if (account && amount > account.availablePoints) {
      setRedeemError("Not enough available points.");
      return;
    }
    setRedeemError("");
    redeemPoints.mutate(amount, {
      onSuccess: () => {
        setRedeemSuccess(true);
        setRedeemAmount("");
        setTimeout(() => {
          setRedeemSuccess(false);
          setRedeemOpen(false);
        }, 2000);
      },
      onError: () => {
        setRedeemError("Redemption failed. Please try again.");
      },
    });
  };

  const redeemValue = (parseInt(redeemAmount, 10) || 0) * 0.01;

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Loyalty Points" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            Loyalty Points
          </h1>
        </header>

        {accountLoading ? (
          <div className="mt-8 space-y-6">
            <div className="h-48 animate-pulse rounded-xl bg-surface-100" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-100" />
              ))}
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-100" />
              ))}
            </div>
          </div>
        ) : !account ? (
          <Card className="mt-8">
            <CardBody className="flex flex-col items-center py-16 text-center">
              <Info size={32} className="text-surface-400" />
              <h2 className="mt-3 text-base font-bold text-surface-900">
                No Loyalty Account Found
              </h2>
              <p className="mt-1 max-w-sm text-sm text-surface-500">
                Start shopping to earn loyalty points and unlock exclusive rewards.
              </p>
            </CardBody>
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <CardBody>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Sparkles size={20} className="text-brand-600" />
                      <span className="text-sm font-semibold text-surface-500">Available Points</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-surface-900">
                      {account.availablePoints.toLocaleString()}{" "}
                      <span className="text-lg font-semibold text-surface-500">points</span>
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-surface-500">
                      <div>
                        <span className="font-medium text-surface-700">
                          {account.lifetimePoints.toLocaleString()}
                        </span>{" "}
                        lifetime
                      </div>
                      <div>
                        <span className="font-medium text-surface-700">
                          {account.pendingPoints.toLocaleString()}
                        </span>{" "}
                        pending
                      </div>
                      {account.pointsExpiringCount > 0 && (
                        <div className="flex items-center gap-1 text-warning-600">
                          <AlertTriangle size={14} />
                          <span className="font-medium">
                            {account.pointsExpiringCount.toLocaleString()}
                          </span>{" "}
                          expiring {formatDate(account.pointsExpiringOn)}
                        </div>
                      )}
                    </div>
                    {nextTier && (
                      <div className="mt-5">
                        <div className="mb-1 flex items-center justify-between text-xs text-surface-500">
                          <span>{currentTier?.name}</span>
                          <span>
                            {(nextTier.minPoints - account.lifetimePoints).toLocaleString()} pts to{" "}
                            {nextTier.name}
                          </span>
                        </div>
                        <LinearProgress value={tierProgress} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-3 sm:items-end">
                    {currentTier && (
                      <div
                        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white"
                        style={{ backgroundColor: currentTier.color }}
                      >
                        <Gift size={16} />
                        {currentTier.name}
                      </div>
                    )}
                    <Button onClick={() => setRedeemOpen(true)}>
                      <Gift size={14} className="mr-1.5" />
                      Redeem Points
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {tiers && tiers.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold tracking-tight text-surface-900">
                  Tier Progress
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {tiers.map((tier, idx) => {
                    const isActive = account.tierLevel === tier.level;
                    const isPast = account.tierLevel > tier.level;
                    return (
                      <div key={tier.level} className="relative">
                        {idx > 0 && (
                          <div className="absolute right-full top-1/2 -z-10 hidden h-px w-3 -translate-y-1/2 bg-surface-300 sm:block" />
                        )}
                        <div
                          className={`flex h-full flex-col items-center rounded-xl border p-4 text-center transition-all ${
                            isActive
                              ? "border-transparent shadow-md ring-2"
                              : isPast
                              ? "border-surface-200 bg-surface-50"
                              : "border-surface-200 bg-surface-0"
                          }`}
                          style={
                            isActive
                              ? { borderColor: tier.color, ["--tw-ring-color" as string]: `${tier.color}33` }
                              : undefined
                          }
                        >
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ backgroundColor: tier.color }}
                          >
                            {tier.level + 1}
                          </div>
                          <h3
                            className={`mt-2 text-sm font-bold ${
                              isActive ? "text-surface-900" : "text-surface-600"
                            }`}
                          >
                            {tier.name}
                          </h3>
                          <p className="mt-1 text-xs text-surface-500">
                            {tier.minPoints.toLocaleString()}
                            {tier.maxPoints < Infinity ? ` – ${tier.maxPoints.toLocaleString()}` : "+"} pts
                          </p>
                          {isActive && (
                            <Badge className="mt-2" variant="success">
                              Current
                            </Badge>
                          )}
                          {isPast && (
                            <CheckCircle size={14} className="mt-2 text-success-500" />
                          )}
                          <ul className="mt-3 space-y-1">
                            {tier.benefits.map((b) => (
                              <li key={b} className="text-xs text-surface-500">
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-bold tracking-tight text-surface-900">
                Transaction History
              </h2>
              {historyLoading ? (
                <div className="mt-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-100" />
                  ))}
                </div>
              ) : sortedTransactions.length === 0 ? (
                <Card className="mt-4">
                  <CardBody className="flex flex-col items-center py-12 text-center">
                    <Clock size={24} className="text-surface-400" />
                    <p className="mt-2 text-sm text-surface-500">No transactions yet.</p>
                  </CardBody>
                </Card>
              ) : (
                <div className="mt-4 space-y-2">
                  {sortedTransactions.map((tx) => {
                    const cfg = TX_CONFIG[tx.type];
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-4 rounded-xl border border-surface-200 bg-surface-0 p-4 transition-colors hover:border-surface-300"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-100 ${cfg.color}`}
                        >
                          {cfg.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-surface-900">
                            {tx.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-surface-500">
                            <span>{cfg.label}</span>
                            <span>&middot;</span>
                            <span>{formatDate(tx.createdAt)}</span>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 text-sm font-bold ${pointsClass(tx.points)}`}
                        >
                          {formatPoints(tx.points)} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        <Modal isOpen={redeemOpen} onClose={() => !redeemPoints.isPending && setRedeemOpen(false)} title="Redeem Points">
          {redeemSuccess ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle size={40} className="text-success-500" />
              <p className="mt-3 text-base font-bold text-surface-900">
                Points redeemed successfully!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-surface-500">
                Enter the number of points you want to redeem. Each point is worth $0.01.
              </p>
              <Input
                label="Points to redeem"
                type="number"
                min={1}
                max={account?.availablePoints ?? 0}
                value={redeemAmount}
                onChange={(e) => {
                  setRedeemAmount(e.target.value);
                  setRedeemError("");
                }}
                placeholder={`Max: ${account?.availablePoints.toLocaleString() ?? 0}`}
              />
              {(parseInt(redeemAmount, 10) || 0) > 0 && (
                <p className="text-sm text-surface-600">
                  Estimated value:{" "}
                  <span className="font-bold text-brand-700">
                    ${redeemValue.toFixed(2)}
                  </span>
                </p>
              )}
              {redeemError && (
                <p className="text-sm font-medium text-danger-600">{redeemError}</p>
              )}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRedeemOpen(false);
                    setRedeemAmount("");
                    setRedeemError("");
                  }}
                  disabled={redeemPoints.isPending}
                >
                  Cancel
                </Button>
                <Button onClick={handleRedeem} disabled={redeemPoints.isPending}>
                  {redeemPoints.isPending ? "Redeeming..." : "Confirm Redemption"}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </Container>
    </div>
  );
}
