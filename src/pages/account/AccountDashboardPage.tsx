import { Link } from "react-router-dom";
import {
  Package,
  MapPin,
  Heart,
  Bell,
  Settings,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
  Truck,
  Award,
  Gift,
  Tag,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Container, Badge, Card, CardBody, CircularProgress, LinearProgress } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useAuth } from "@/hooks/auth";
import { useAccountCompletion } from "@/hooks/account";
import { useOrderHistory } from "@/hooks/checkout/useCheckout";
import { useAddresses } from "@/hooks/checkout/useAddress";
import { usePrescriptionUpload } from "@/hooks/checkout/usePrescriptionUpload";
import { useWishlist } from "@/hooks/shopping";
import { useLoyaltyAccount } from "@/hooks/engagement/useLoyalty";
import { useOffers } from "@/hooks/engagement/useOffers";
import { useMembershipStatus } from "@/hooks/engagement/useMembership";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { OrderStatus } from "@/types/checkout";

const STATUS_VARIANTS: Record<OrderStatus, "success" | "warning" | "info" | "danger"> = {
  placed: "info",
  confirmed: "info",
  processing: "warning",
  packed: "warning",
  shipped: "warning",
  out_for_delivery: "warning",
  delivered: "success",
  cancelled: "danger",
};

export default function AccountDashboardPage() {
  usePageTitle("My Account");

  const { user } = useAuth();
  const { data: completion } = useAccountCompletion();
  const { data: orders } = useOrderHistory();
  const { data: addresses } = useAddresses();
  const { files: prescriptions } = usePrescriptionUpload();
  const { count: wishlistCount } = useWishlist();
  const { data: loyalty } = useLoyaltyAccount();
  const { data: activeOffers } = useOffers("active");
  const { data: membership } = useMembershipStatus();

  const recentOrders = orders?.slice(0, 3) ?? [];
  const displayAddresses = addresses?.slice(0, 2) ?? [];

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "My Account" },
          ]}
        />

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
              Welcome back, {user?.fullName?.split(" ")[0] ?? "User"}
            </h1>
            <p className="text-sm text-surface-500">{user?.email}</p>
          </div>
        </div>

        {completion && (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardBody>
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <CircularProgress value={completion.percentage} size={96} strokeWidth={8} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-surface-900">Account Completion</h2>
                    <p className="mt-1 text-sm text-surface-500">
                      Complete your profile to get the best experience.
                    </p>
                    <div className="mt-4 space-y-3">
                      <CompletionItem
                        label="Profile details"
                        done={completion.hasProfile}
                      />
                      <CompletionItem
                        label="Saved addresses"
                        done={completion.hasAddresses}
                      />
                      <CompletionItem
                        label="Prescription records"
                        done={completion.hasPrescriptions}
                      />
                    </div>
                    <div className="mt-4">
                      <LinearProgress value={completion.percentage} />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-col items-center justify-center py-8">
                <Bell size={28} className="text-surface-400" />
                <h3 className="mt-3 text-sm font-bold text-surface-900">Notifications</h3>
                <p className="mt-1 text-center text-xs text-surface-500">
                  Stay updated on your orders and offers.
                </p>
                <Link
                  to="/notifications"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </CardBody>
            </Card>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold tracking-tight text-surface-900">Quick Actions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              to="/orders"
              icon={<Package size={20} />}
              title="My Orders"
              description={`${orders?.length ?? 0} order${(orders?.length ?? 0) !== 1 ? "s" : ""}`}
            />
            <QuickActionCard
              to="/addresses"
              icon={<MapPin size={20} />}
              title="My Addresses"
              description={`${addresses?.length ?? 0} saved`}
            />
            <QuickActionCard
              to="/prescriptions"
              icon={<FileText size={20} />}
              title="Prescriptions"
              description={`${prescriptions.length} uploaded`}
            />
            <QuickActionCard
              to="/wishlist"
              icon={<Heart size={20} />}
              title="Wishlist"
              description={`${wishlistCount} item${wishlistCount !== 1 ? "s" : ""}`}
            />
            <QuickActionCard
              to="/help"
              icon={<HelpCircle size={20} />}
              title="Help & Support"
              description="Get help with orders"
            />
          </div>
        </div>

        {/* Engagement Widgets */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Loyalty Points Card */}
          {loyalty && (
            <Link to="/rewards">
              <Card interactive className="h-full">
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                      <Award size={22} className="text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-surface-900">Loyalty Points</h3>
                      <p className="mt-1 text-2xl font-bold text-brand-700">{loyalty.availablePoints.toLocaleString()}</p>
                      <p className="text-xs text-surface-500">{loyalty.tierName} Member</p>
                      {loyalty.pointsExpiringCount > 0 && (
                        <p className="mt-1 text-xs text-warning-600">
                          {loyalty.pointsExpiringCount} points expiring soon
                        </p>
                      )}
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-surface-400" />
                  </div>
                </CardBody>
              </Card>
            </Link>
          )}

          {/* Active Offers Card */}
          {activeOffers && activeOffers.length > 0 && (
            <Link to="/offers">
              <Card interactive className="h-full">
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-50">
                      <Tag size={22} className="text-success-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-surface-900">Active Offers</h3>
                      <p className="mt-1 text-2xl font-bold text-success-700">{activeOffers.length}</p>
                      <p className="text-xs text-surface-500 truncate">{activeOffers[0]?.title}</p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-surface-400" />
                  </div>
                </CardBody>
              </Card>
            </Link>
          )}

          {/* Membership Card */}
          {membership && (
            <Link to="/membership">
              <Card interactive className="h-full">
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                      <Sparkles size={22} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-surface-900">Membership</h3>
                      <p className="mt-1 text-lg font-bold text-amber-700">{membership.currentTier}</p>
                      {membership.nextTier && (
                        <p className="text-xs text-surface-500">
                          ${membership.spendToNextTier} to {membership.nextTier}
                        </p>
                      )}
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-surface-400" />
                  </div>
                </CardBody>
              </Card>
            </Link>
          )}
        </div>

        {/* Referral Quick Link */}
        <div className="mt-4">
          <Link to="/referral">
            <Card interactive>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50">
                    <Gift size={20} className="text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">Refer & Earn</h3>
                    <p className="text-xs text-surface-500">
                      Invite friends and earn 100 points per referral.
                    </p>
                  </div>
                  <ArrowRight size={16} className="ml-auto shrink-0 text-surface-400" />
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>

        {recentOrders.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-surface-900">Recent Orders</h2>
              <Link
                to="/orders"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block rounded-xl border border-surface-200 bg-surface-0 p-4 transition-all hover:border-surface-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck size={16} className="text-brand-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-surface-900">{order.id}</span>
                          <Badge variant={STATUS_VARIANTS[order.status]}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-surface-500">
                          {formatDate(order.placedAt)} &middot; {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-brand-700">
                      {formatCurrency(order.grandTotal)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {displayAddresses.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-surface-900">Saved Addresses</h2>
              <Link
                to="/addresses"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Manage <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {displayAddresses.map((addr) => (
                <Card key={addr.id}>
                  <CardBody>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{addr.label}</p>
                        <p className="mt-0.5 text-xs text-surface-500">{addr.city}</p>
                        {addr.isDefault && (
                          <Badge variant="success" className="mt-2">Default</Badge>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link to="/prescriptions">
            <Card interactive>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                    <FileText size={20} className="text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">Prescriptions</h3>
                    <p className="text-xs text-surface-500">
                      {prescriptions.length} file{prescriptions.length !== 1 ? "s" : ""} uploaded
                    </p>
                  </div>
                  <ArrowRight size={16} className="ml-auto shrink-0 text-surface-400" />
                </div>
              </CardBody>
            </Card>
          </Link>
          <Link to="/wishlist">
            <Card interactive>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                    <Heart size={20} className="text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">Wishlist</h3>
                    <p className="text-xs text-surface-500">
                      {wishlistCount} item{wishlistCount !== 1 ? "s" : ""} saved
                    </p>
                  </div>
                  <ArrowRight size={16} className="ml-auto shrink-0 text-surface-400" />
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>

        <div className="mt-8">
          <Link to="/settings">
            <Card interactive>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-100">
                    <Settings size={20} className="text-surface-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">Account Settings</h3>
                    <p className="text-xs text-surface-500">
                      Manage your profile, preferences, and security.
                    </p>
                  </div>
                  <ArrowRight size={16} className="ml-auto shrink-0 text-surface-400" />
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>
      </Container>
    </div>
  );
}

function CompletionItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle size={16} className="shrink-0 text-success-600" />
      ) : (
        <AlertCircle size={16} className="shrink-0 text-surface-400" />
      )}
      <span className={`text-sm ${done ? "text-surface-700" : "text-surface-500"}`}>
        {label}
      </span>
    </div>
  );
}

function QuickActionCard({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link to={to}>
      <Card interactive className="h-full">
        <CardBody>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-surface-900">{title}</h3>
              <p className="text-xs text-surface-500 truncate">{description}</p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-surface-400" />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
