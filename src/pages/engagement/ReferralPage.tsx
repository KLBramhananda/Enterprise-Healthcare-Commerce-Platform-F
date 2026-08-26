import { useState } from "react";
import { Copy, Share2, Send, Gift, Users, CheckCircle, Mail, Clock, Sparkles } from "lucide-react";
import { Container, Card, CardBody, Badge, Button, Input } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useReferralInfo, useSendReferral } from "@/hooks/engagement";
import { formatDate } from "@/utils/formatters";
import type { ReferralStatus } from "@/types/engagement";

const STATUS_VARIANTS: Record<ReferralStatus, "success" | "warning" | "default"> = {
  completed: "success",
  pending: "warning",
  expired: "default",
};

export default function ReferralPage() {
  usePageTitle("Refer & Earn");

  const { data: referralInfo, isLoading } = useReferralInfo();
  const sendReferral = useSendReferral();

  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleCopyCode = async () => {
    if (!referralInfo?.referralCode) return;
    await navigator.clipboard.writeText(referralInfo.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    if (!referralInfo?.referralLink) return;
    await navigator.clipboard.writeText(referralInfo.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = () => {
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    sendReferral.mutate(email, {
      onSuccess: () => {
        setEmail("");
        setInviteSent(true);
        setTimeout(() => setInviteSent(false), 3000);
      },
    });
  };

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Refer & Earn" },
          ]}
        />

        <header className="mt-6 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            Refer & Earn
          </h1>
        </header>

        <div className="mt-6 max-w-3xl space-y-6 mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-white/5" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={20} className="text-brand-200" />
                <span className="text-sm font-medium text-brand-200">Referral Program</span>
              </div>
              <h2 className="text-2xl font-bold">Invite Friends, Earn Rewards</h2>
              <p className="mt-2 max-w-lg text-sm text-brand-100">
                Share your referral code with friends. When they make their first purchase, you both earn{" "}
                <span className="font-semibold text-white">{referralInfo?.rewardPerReferral ?? 100}</span>{" "}
                reward points. The more friends you invite, the more you earn!
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 backdrop-blur-sm">
                  <span className="text-sm font-medium text-brand-200">Your Code</span>
                  <span className="text-xl font-bold tracking-wider">
                    {referralInfo?.referralCode ?? "—"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleCopyCode} disabled={!referralInfo}>
                    {copied ? (
                      <CheckCircle size={14} className="mr-1.5" />
                    ) : (
                      <Copy size={14} className="mr-1.5" />
                    )}
                    {copied ? "Copied!" : "Copy Code"}
                  </Button>
                  <Button variant="secondary" onClick={handleCopyLink} disabled={!referralInfo}>
                    <Share2 size={14} className="mr-1.5" />
                    Share Link
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardBody className="flex items-center gap-4 py-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-info-50">
                  <Users size={20} className="text-info-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900">
                    {referralInfo?.totalReferred ?? 0}
                  </p>
                  <p className="text-xs text-surface-500">Total Referred</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-4 py-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-50">
                  <CheckCircle size={20} className="text-success-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900">
                    {referralInfo?.completedReferrals ?? 0}
                  </p>
                  <p className="text-xs text-surface-500">Completed</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-4 py-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                  <Gift size={20} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900">
                    {referralInfo?.totalRewardPoints ?? 0}
                  </p>
                  <p className="text-xs text-surface-500">Points Earned</p>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody>
              <h3 className="text-base font-semibold text-surface-900">Send an Invite</h3>
              <p className="mt-1 text-sm text-surface-500">
                Enter a friend's email and we'll send them a referral invitation.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <Input
                    label="Friend's Email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    placeholder="friend@example.com"
                    error={emailError || undefined}
                  />
                </div>
                <div className="flex items-end gap-2 pt-0.5">
                  <Button
                    onClick={handleSendInvite}
                    disabled={sendReferral.isPending}
                  >
                    {sendReferral.isPending ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send size={14} className="mr-1.5" />
                        Send Invite
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {inviteSent && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-success-50 px-4 py-2.5 text-sm text-success-700">
                  <CheckCircle size={14} />
                  Invitation sent successfully!
                </div>
              )}
              {sendReferral.isError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-danger-50 px-4 py-2.5 text-sm text-danger-700">
                  <Mail size={14} />
                  Failed to send invitation. Please try again.
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-base font-semibold text-surface-900">Referral History</h3>

              {isLoading ? (
                <div className="mt-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-100" />
                  ))}
                </div>
              ) : referralInfo && referralInfo.referrals.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {referralInfo.referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-0 p-4"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-100">
                          <Mail size={16} className="text-surface-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-surface-900">
                              {referral.referredName ?? referral.referredEmail}
                            </p>
                            <Badge variant={STATUS_VARIANTS[referral.status]}>
                              {referral.status}
                            </Badge>
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-surface-500">
                            <Clock size={12} />
                            Invited {formatDate(referral.invitedAt)}
                            {referral.completedAt && (
                              <> &middot; Completed {formatDate(referral.completedAt)}</>
                            )}
                          </p>
                        </div>
                      </div>
                      {referral.rewardPoints != null && referral.rewardPoints > 0 && (
                        <div className="shrink-0 ml-4 text-right">
                          <span className="text-sm font-bold text-brand-600">
                            +{referral.rewardPoints}
                          </span>
                          <p className="text-xs text-surface-500">points</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center justify-center py-10">
                  <Users size={40} className="text-surface-300" />
                  <p className="mt-3 text-sm font-medium text-surface-500">No referrals yet</p>
                  <p className="mt-1 text-xs text-surface-400">
                    Share your code or send an invite to get started!
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </Container>
    </div>
  );
}
