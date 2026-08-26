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
 */

import { useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
  Bell,
  ClipboardList,
  Gift,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  Percent,
  Settings,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { APP_NAME } from "@/config/constants";
import { useAuth } from "@/hooks/auth";
import { useAuthStore } from "@/store/authStore";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { isAuthenticated, user } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Desktop: click-outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  // Desktop: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleLogout = useCallback(() => {
    clearAuth();
    onClose();
    navigate("/", { replace: true });
  }, [clearAuth, navigate, onClose]);

  const navigateAndClose = useCallback(
    (path: string) => {
      onClose();
      navigate(path);
    },
    [navigate, onClose],
  );

  return (
    <>
      {/* ── Desktop dropdown (sm+) ── */}
      <div className="relative hidden sm:block" ref={dropdownRef}>
        {isOpen && (
          <div role="menu" aria-label="Account menu" className="absolute right-0 top-full z-dropdown mt-1 w-56 rounded-xl border border-surface-200 bg-surface-0 py-1 shadow-lg">
            {isAuthenticated ? (
            <>
              <div className="border-b border-surface-100 px-4 py-3">
                <p className="text-sm font-semibold text-surface-900">
                  {user?.fullName ?? "My Account"}
                </p>
                <p className="mt-0.5 text-xs text-surface-500">{user?.email}</p>
              </div>
              <MenuItem icon={<User size={15} />} label="My Profile" onClick={() => navigateAndClose("/profile")} />
              <MenuItem icon={<Package size={15} />} label="My Orders" onClick={() => navigateAndClose("/orders")} />
              <MenuItem icon={<ClipboardList size={15} />} label="Prescriptions" onClick={() => navigateAndClose("/prescriptions")} />
              <MenuItem icon={<Heart size={15} />} label="Wishlist" onClick={() => navigateAndClose("/wishlist")} />
              <MenuItem icon={<MapPin size={15} />} label="My Addresses" onClick={() => navigateAndClose("/addresses")} />
              <div className="my-1 border-t border-surface-100" />
              <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                Engagement
              </p>
              <MenuItem icon={<Tag size={15} />} label="Offers & Deals" onClick={() => navigateAndClose("/offers")} />
              <MenuItem icon={<Percent size={15} />} label="My Coupons" onClick={() => navigateAndClose("/coupons")} />
              <MenuItem icon={<Award size={15} />} label="Loyalty Points" onClick={() => navigateAndClose("/rewards")} />
              <MenuItem icon={<Gift size={15} />} label="Refer & Earn" onClick={() => navigateAndClose("/referral")} />
              <MenuItem icon={<Sparkles size={15} />} label="Membership" onClick={() => navigateAndClose("/membership")} />
              <div className="my-1 border-t border-surface-100" />
              <MenuItem icon={<Bell size={15} />} label="Notifications" onClick={() => navigateAndClose("/notifications")} />
              <MenuItem icon={<Settings size={15} />} label="Settings" onClick={() => navigateAndClose("/profile")} />
              <div className="my-1 border-t border-surface-100" />
              <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                Support
              </p>
              <MenuItem icon={<HelpCircle size={15} />} label="Help Center" onClick={() => navigateAndClose("/help")} />
              <div className="my-1 border-t border-surface-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-danger-600 transition-colors duration-fast hover:bg-danger-50"
              >
                <LogOut size={15} />
                <span>Log out</span>
              </button>
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
        </div>
        )}
      </div>

      {/* ── Mobile drawer (<sm) ── */}
      <Drawer isOpen={isOpen} onClose={onClose} side="right" title="Account">
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
                <DrawerItem icon={<User size={16} />} label="My Profile" onClick={() => navigateAndClose("/profile")} />
                <DrawerItem icon={<Package size={16} />} label="My Orders" onClick={() => navigateAndClose("/orders")} />
                <DrawerItem icon={<ClipboardList size={16} />} label="Prescriptions" onClick={() => navigateAndClose("/prescriptions")} />
                <DrawerItem icon={<Heart size={16} />} label="Wishlist" onClick={() => navigateAndClose("/wishlist")} />
                <DrawerItem icon={<MapPin size={16} />} label="My Addresses" onClick={() => navigateAndClose("/addresses")} />
              </div>

              <div className="mt-4 space-y-1 border-t border-surface-100 pt-4">
                <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                  Engagement
                </p>
                <DrawerItem icon={<Tag size={16} />} label="Offers & Deals" onClick={() => navigateAndClose("/offers")} />
                <DrawerItem icon={<Percent size={16} />} label="My Coupons" onClick={() => navigateAndClose("/coupons")} />
                <DrawerItem icon={<Award size={16} />} label="Loyalty Points" onClick={() => navigateAndClose("/rewards")} />
                <DrawerItem icon={<Gift size={16} />} label="Refer & Earn" onClick={() => navigateAndClose("/referral")} />
                <DrawerItem icon={<Sparkles size={16} />} label="Membership" onClick={() => navigateAndClose("/membership")} />
              </div>

              <div className="mt-4 space-y-1 border-t border-surface-100 pt-4">
                <DrawerItem icon={<Bell size={16} />} label="Notifications" onClick={() => navigateAndClose("/notifications")} />
                <DrawerItem icon={<Settings size={16} />} label="Settings" onClick={() => navigateAndClose("/profile")} />
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
