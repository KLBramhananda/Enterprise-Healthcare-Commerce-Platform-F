/**
 * ProfileMenu
 *
 * Account menu for the commerce header.
 * - Desktop (sm+): absolute dropdown anchored to the trigger button.
 * - Mobile (<sm): opens a right-side Drawer via React Portal.
 *
 * Displays authenticated account links (profile, orders, prescriptions,
 * wishlist, addresses, engagement, notifications, settings, logout)
 * or unauthenticated sign-in/register actions.
 *
 * The desktop dropdown is bounded to the viewport (header offset subtracted)
 * and scrolls internally; the Logout action is pinned at the bottom of the
 * menu, visually separated from the navigation items.
 */

import { useCallback, type RefObject } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
  Bell,
  ClipboardList,
  Gift,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Percent,
  Shield,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { Drawer, Popover } from "@/components/ui";
import { APP_NAME } from "@/config/constants";
import { useAuth } from "@/hooks/auth";

/**
 * Desktop dropdown height cap: the menu must never exceed the viewport.
 * The measured header offset (main nav + category nav, from useScrollLayout)
 * is subtracted so the list scrolls internally instead of pushing the page
 * or cutting off items on short viewports.
 */
const PROFILE_MENU_MAX_HEIGHT =
  "calc(100vh - var(--layout-header-main-h) - var(--layout-header-cat-h) - 1rem)";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  /** Anchor element (the header account button) for the desktop popover. */
  anchorRef?: RefObject<HTMLButtonElement | null>;
}

export default function ProfileMenu({ isOpen, onClose, anchorRef }: ProfileMenuProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    onClose();
    navigate("/", { replace: true });
  }, [logout, navigate, onClose]);

  const navigateAndClose = useCallback(
    (path: string) => {
      onClose();
      navigate(path);
    },
    [navigate, onClose],
  );

  return (
    <>
      {/* ── Desktop popover (sm+) ── */}
      <Popover
        open={isOpen}
        onOpenChange={(o) => {
          if (!o) onClose();
        }}
        anchorRef={anchorRef}
        placement="bottom-end"
        role="menu"
        ariaLabel="Account menu"
        maxHeight={PROFILE_MENU_MAX_HEIGHT}
        className="hidden w-56 py-1 sm:flex sm:flex-col"
      >
        {isAuthenticated ? (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <div className="border-b border-surface-100 px-4 py-3">
                  <p className="text-sm font-semibold text-surface-900">
                    {user?.fullName ?? "My Account"}
                  </p>
                  <p className="mt-0.5 text-xs text-surface-500">{user?.email}</p>
                </div>
                <MenuItem icon={<LayoutDashboard size={15} />} label="Dashboard" onClick={() => navigateAndClose("/account/dashboard")} />
                <MenuItem icon={<User size={15} />} label="My Profile" onClick={() => navigateAndClose("/account/profile")} />
                <MenuItem icon={<Package size={15} />} label="My Orders" onClick={() => navigateAndClose("/account/orders")} />
                <MenuItem icon={<ClipboardList size={15} />} label="Prescriptions" onClick={() => navigateAndClose("/account/prescriptions")} />
                <MenuItem icon={<Heart size={15} />} label="Wishlist" onClick={() => navigateAndClose("/account/wishlist")} />
                <MenuItem icon={<MapPin size={15} />} label="My Addresses" onClick={() => navigateAndClose("/account/addresses")} />
                <div className="my-1 border-t border-surface-100" />
                <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                  Engagement
                </p>
                <MenuItem icon={<Tag size={15} />} label="Offers & Deals" onClick={() => navigateAndClose("/account/offers")} />
                <MenuItem icon={<Percent size={15} />} label="My Coupons" onClick={() => navigateAndClose("/account/coupons")} />
                <MenuItem icon={<Award size={15} />} label="Loyalty Points" onClick={() => navigateAndClose("/account/loyalty")} />
                <MenuItem icon={<Gift size={15} />} label="Refer & Earn" onClick={() => navigateAndClose("/account/referral")} />
                <MenuItem icon={<Sparkles size={15} />} label="Membership" onClick={() => navigateAndClose("/account/membership")} />
                <div className="my-1 border-t border-surface-100" />
                <MenuItem icon={<Bell size={15} />} label="Notifications" onClick={() => navigateAndClose("/account/notifications")} />
                <MenuItem icon={<Shield size={15} />} label="Security" onClick={() => navigateAndClose("/account/security")} />
                <div className="my-1 border-t border-surface-100" />
                <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                  Support
                </p>
                <MenuItem icon={<HelpCircle size={15} />} label="Help Center" onClick={() => navigateAndClose("/help")} />
              </div>

              {/* Logout — pinned footer, always visible and separated from navigation */}
              <div className="border-t border-surface-100 p-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-danger-600 transition-colors duration-fast hover:bg-danger-50"
                >
                  <LogOut size={15} />
                  <span>Log out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-surface-100 px-4 py-3">
                <p className="text-sm font-semibold text-surface-900">Welcome to {APP_NAME}</p>
                <p className="mt-0.5 text-xs text-surface-500">Sign in to access your account</p>
              </div>
              <div className="p-2">
                <Link
                  to="/auth/login"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-fast hover:bg-brand-700"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth/register"
                  onClick={onClose}
                  className="mt-2 flex w-full items-center justify-center rounded-lg border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-700 transition-colors duration-fast hover:bg-surface-50"
                >
                  Create account
                </Link>
              </div>
              <div className="my-1 border-t border-surface-100" />
              <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                Quick links
              </p>
              <MenuItem icon={<Package size={15} />} label="Track Order" onClick={() => navigateAndClose("/auth/login")} />
              <MenuItem icon={<ClipboardList size={15} />} label="Upload Prescription" onClick={() => navigateAndClose("/auth/login")} />
            </>
          )}
      </Popover>

      {/* ── Mobile drawer (<sm) ── */}
      <Drawer isOpen={isOpen} onClose={onClose} side="right" title="Account" desktopHidden>
        <div className="p-4">
          {isAuthenticated ? (
            <>
              <div className="rounded-lg bg-brand-50 px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                    {(user?.fullName ?? "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-surface-900 truncate">
                      {user?.fullName ?? "My Account"}
                    </p>
                    <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                  Account
                </p>
                <DrawerItem icon={<LayoutDashboard size={16} />} label="Dashboard" onClick={() => navigateAndClose("/account/dashboard")} />
                <DrawerItem icon={<User size={16} />} label="My Profile" onClick={() => navigateAndClose("/account/profile")} />
                <DrawerItem icon={<Package size={16} />} label="My Orders" onClick={() => navigateAndClose("/account/orders")} />
                <DrawerItem icon={<ClipboardList size={16} />} label="Prescriptions" onClick={() => navigateAndClose("/account/prescriptions")} />
                <DrawerItem icon={<Heart size={16} />} label="Wishlist" onClick={() => navigateAndClose("/account/wishlist")} />
                <DrawerItem icon={<MapPin size={16} />} label="My Addresses" onClick={() => navigateAndClose("/account/addresses")} />
              </div>

              <div className="mt-4 space-y-1 border-t border-surface-100 pt-4">
                <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                  Engagement
                </p>
                <DrawerItem icon={<Tag size={16} />} label="Offers & Deals" onClick={() => navigateAndClose("/account/offers")} />
                <DrawerItem icon={<Percent size={16} />} label="My Coupons" onClick={() => navigateAndClose("/account/coupons")} />
                <DrawerItem icon={<Award size={16} />} label="Loyalty Points" onClick={() => navigateAndClose("/account/loyalty")} />
                <DrawerItem icon={<Gift size={16} />} label="Refer & Earn" onClick={() => navigateAndClose("/account/referral")} />
                <DrawerItem icon={<Sparkles size={16} />} label="Membership" onClick={() => navigateAndClose("/account/membership")} />
              </div>

              <div className="mt-4 space-y-1 border-t border-surface-100 pt-4">
                <DrawerItem icon={<Bell size={16} />} label="Notifications" onClick={() => navigateAndClose("/account/notifications")} />
                <DrawerItem icon={<Shield size={16} />} label="Security" onClick={() => navigateAndClose("/account/security")} />
              </div>

              <div className="mt-4 space-y-1 border-t border-surface-100 pt-4">
                <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                  Support
                </p>
                <DrawerItem icon={<HelpCircle size={16} />} label="Help Center" onClick={() => navigateAndClose("/help")} />
                <DrawerItem icon={<Package size={16} />} label="My Tickets" onClick={() => navigateAndClose("/help/tickets")} />
              </div>

              <div className="mt-4 border-t border-surface-100 pt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-600 transition-colors duration-fast hover:bg-danger-50"
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg bg-brand-50 p-4 text-center">
                <p className="text-sm font-medium text-surface-700">
                  Sign in to access your account
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    to="/auth/login"
                    onClick={onClose}
                    className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-surface-200 px-4 py-2.5 text-center text-sm font-medium text-surface-700 hover:bg-surface-0"
                  >
                    Create account
                  </Link>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                  Quick links
                </p>
                <DrawerItem icon={<Package size={16} />} label="Track Order" onClick={() => navigateAndClose("/auth/login")} />
                <DrawerItem icon={<ClipboardList size={16} />} label="Upload Prescription" onClick={() => navigateAndClose("/auth/login")} />
              </div>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-surface-700 transition-colors duration-fast hover:bg-surface-50 hover:text-brand-700"
    >
      <span className="text-surface-400">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function DrawerItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 transition-colors duration-fast hover:bg-brand-50 hover:text-brand-700"
    >
      <span className="text-surface-400">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
