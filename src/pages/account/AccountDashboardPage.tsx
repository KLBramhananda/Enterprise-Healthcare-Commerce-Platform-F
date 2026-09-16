import { Link } from "react-router-dom";
import {
  Package,
  MapPin,
  Heart,
  Bell,
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
  ChevronRight,
} from "lucide-react";
import { Badge, Card, CardBody, CircularProgress, LinearProgress } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useAuth } from "@/hooks/auth";
import { useAccountCompletion } from "@/hooks/account";
import { useOrders } from "@/hooks/orders";
import { useAddresses } from "@/hooks/checkout/useAddress";
import { usePrescriptionUpload } from "@/hooks/checkout/usePrescriptionUpload";
import { useWishlist } from "@/hooks/shopping";
import { useLoyaltyAccount } from "@/hooks/engagement/useLoyalty";
import { useOffers } from "@/hooks/engagement/useOffers";
import { useMembershipStatus } from "@/hooks/engagement/useMembership";
import { useUnreadNotificationCount } from "@/hooks/account";
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
  const { data: orders } = useOrders();
  const { data: addresses } = useAddresses();
  const { files: prescriptions } = usePrescriptionUpload();
  const { count: wishlistCount } = useWishlist();
  const { data: loyalty } = useLoyaltyAccount();
  const { data: activeOffers } = useOffers("active");
  const { data: membership } = useMembershipStatus();
  const { data: unreadCount } = useUnreadNotificationCount();

  const recentOrders = orders?.slice(0, 3) ?? [];
  const displayAddresses = addresses?.slice(0, 2) ?? [];

  return (
    <div className="min-w-0 flex-1">
      <Breadcrumb
        className="py-2"
        items={[
          { label: "Home", path: "/" },
          { label: "My Account" },
        ]}
      />

      <div className="mt-2 flex items-center gap-4">
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
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardBody>
              <div className="flex items-start gap-5">
                <div className="shrink-0">
                  <CircularProgress value={completion.percentage} size={92} strokeWidth={8} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-surface-900">Account Completion</h2>
                  <p className="mt-1 text-sm text-surface-500">
                    Complete your profile to get the best experience.
                  </p>
                  <div className="mt-3 space-y-2.5">
                    <CompletionItem label="Profile details" done={completion.hasProfile} />
                    <CompletionItem label="Saved addresses" done={completion.hasAddresses} />
                    <CompletionItem label="Prescription records" done={completion.hasPrescriptions} />
                  </div>
                  <div className="mt-3">
                    <LinearProgress value={completion.percentage} />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Link to="/account/notifications" className="group">
            <Card interactive className="h-full">
              <CardBody className="flex h-full flex-col items-center justify-center py-8">
                <div className="relative">
                  <Bell size={28} className="text-surface-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-bold text-surface-900">Notifications</h3>
                <p className="mt-1 text-center text-xs text-surface-500">
                  Stay updated on your orders and offers.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors group-hover:text-brand-700">
                  View all <ArrowRight size={14} />
                </span>
              </CardBody>
            </Card>
          </Link>
        </div>
      )}

      <div className="mt-7">
        <SectionHeading title="Quick Actions" />
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            to="/account/orders"
            icon={<Package size={20} />}
            title="My Orders"
            description={`${orders?.length ?? 0} order${(orders?.length ?? 0) !== 1 ? "s" : ""}`}
          />
          <QuickActionCard
            to="/account/addresses"
            icon={<MapPin size={20} />}
            title="My Addresses"
            description={`${addresses?.length ?? 0} saved`}
          />
          <QuickActionCard
            to="/account/prescriptions"
            icon={<FileText size={20} />}
            title="Prescriptions"
            description={`${prescriptions.length} uploaded`}
          />
          <QuickActionCard
            to="/account/wishlist"
            icon={<Heart size={20} />}
            title="Wishlist"
            description={`${wishlistCount} item${wishlistCount !== 1 ? "s" : ""}`}
          />
        </div>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        {loyalty && (
          <Link to="/account/loyalty" className="group">
            <Card interactive className="h-full">
              <CardBody>
                <SummaryWidget
                  icon={<Award size={22} />}
                  iconClassName="bg-brand-50 text-brand-600"
                  title="Loyalty Points"
                  value={loyalty.availablePoints.toLocaleString()}
                  valueClassName="text-brand-700"
                  subtitle={`${loyalty.tierName} Member`}
                />
              </CardBody>
            </Card>
          </Link>
        )}

        {activeOffers && activeOffers.length > 0 && (
          <Link to="/account/offers" className="group">
            <Card interactive className="h-full">
              <CardBody>
                <SummaryWidget
                  icon={<Tag size={22} />}
                  iconClassName="bg-success-50 text-success-600"
                  title="Active Offers"
                  value={String(activeOffers.length)}
                  valueClassName="text-success-700"
                  subtitle={activeOffers[0]?.title}
                />
              </CardBody>
            </Card>
          </Link>
        )}

        {membership && (
          <Link to="/account/membership" className="group">
            <Card interactive className="h-full">
              <CardBody>
                <SummaryWidget
                  icon={<Sparkles size={22} />}
                  iconClassName="bg-amber-50 text-amber-600"
                  title="Membership"
                  value={membership.currentTier}
                  valueClassName="text-amber-700 text-lg"
                  subtitle={
                    membership.nextTier
                      ? `${formatCurrency(membership.spendToNextTier)} to ${membership.nextTier}`
                      : "Highest tier reached"
                  }
                />
              </CardBody>
            </Card>
          </Link>
        )}
      </div>

      {recentOrders.length > 0 && (
        <div className="mt-7">
          <SectionHeading
            title="Recent Orders"
            action={{ label: "View all", to: "/account/orders" }}
          />
          <div className="mt-3 space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="block rounded-xl border border-surface-200 bg-surface-0 p-4 transition-all hover:border-surface-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck size={16} className="text-brand-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-surface-900">{order.id}</span>
                        <Badge variant={STATUS_VARIANTS[order.status]}>{order.status}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-surface-500">
                        {formatDate(order.placedAt)} &middot; {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
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
        <div className="mt-7">
          <SectionHeading
            title="Saved Addresses"
            action={{ label: "Manage", to: "/account/addresses" }}
          />
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {displayAddresses.map((addr) => (
              <Card key={addr.id}>
                <CardBody>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />
                    <div>
                      <p className="text-sm font-semibold text-surface-900">{addr.label}</p>
                      <p className="mt-0.5 text-xs text-surface-500">{addr.city}</p>
                      {addr.isDefault && (
                        <Badge variant="success" className="mt-2">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Link to="/account/prescriptions" className="group">
          <Card interactive>
            <CardBody>
              <SummaryWidget
                icon={<FileText size={20} />}
                iconClassName="bg-brand-50 text-brand-600"
                title="Prescriptions"
                value={`${prescriptions.length} file${prescriptions.length !== 1 ? "s" : ""} uploaded`}
                valueClassName="text-lg text-surface-900"
              />
            </CardBody>
          </Card>
        </Link>
        <Link to="/account/wishlist" className="group">
          <Card interactive>
            <CardBody>
              <SummaryWidget
                icon={<Heart size={20} />}
                iconClassName="bg-brand-50 text-brand-600"
                title="Wishlist"
                value={`${wishlistCount} item${wishlistCount !== 1 ? "s" : ""} saved`}
                valueClassName="text-lg text-surface-900"
              />
            </CardBody>
          </Card>
        </Link>
      </div>

      <div className="mt-7">
        <Link to="/account/referral" className="group">
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

      <div className="mt-7">
        <Link to="/help" className="group">
          <Card interactive>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-100">
                  <HelpCircle size={20} className="text-surface-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900">Help & Support</h3>
                  <p className="text-xs text-surface-500">
                    Get help with orders, returns, and prescriptions.
                  </p>
                </div>
                <ChevronRight size={16} className="ml-auto shrink-0 text-surface-400" />
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold tracking-tight text-surface-900">{title}</h2>
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          {action.label} <ArrowRight size={14} />
        </Link>
      )}
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
      <span className={`text-sm ${done ? "text-surface-700" : "text-surface-500"}`}>{label}</span>
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
              <p className="truncate text-xs text-surface-500">{description}</p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-surface-400" />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

function SummaryWidget({
  icon,
  iconClassName,
  title,
  value,
  valueClassName,
  subtitle,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  value: string;
  valueClassName: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-surface-900">{title}</h3>
        <p className={`mt-1 text-2xl font-bold ${valueClassName}`}>{value}</p>
        {subtitle && <p className="truncate text-xs text-surface-500">{subtitle}</p>}
      </div>
      <ArrowRight size={16} className="shrink-0 text-surface-400" />
    </div>
  );
}