/**
 * CommerceHeader
 *
 * Top commerce header with announcement bar, branding, search, account menu, and category navigation.
 * Auth-aware: shows guest account menu (login/register) or authenticated account dropdown (profile, orders, etc.).
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Award,
  Bell,
  ClipboardList,
  Heart,
  LogOut,
  MapPin,
  Package,
  Search,
  Settings,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { commerceCategories, type NavigationItem } from "@/config/navigation";
import { ANNOUNCEMENT_TEXT, APP_NAME } from "@/config/constants";
import { cn } from "@/utils/cn";
import { Container } from "@/components/ui";
import { useAuth } from "@/hooks/auth";
import { useAuthStore } from "@/store/authStore";

export default function CommerceHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    clearAuth();
    setAccountMenuOpen(false);
    navigate("/", { replace: true });
  }, [clearAuth, navigate]);

  const navigateAndClose = useCallback(
    (path: string) => {
      setAccountMenuOpen(false);
      setMobileMenuOpen(false);
      navigate(path);
    },
    [navigate],
  );

  // Close account menu on outside click
  useEffect(() => {
    if (!accountMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  return (
    <header className="sticky top-0 z-sticky w-full">
      {/* Announcement Bar */}
      <div className="bg-brand-600 px-4 py-2 text-center">
        <p className="text-xs font-medium text-white sm:text-sm">{ANNOUNCEMENT_TEXT}</p>
      </div>

      {/* Main Header */}
      <div className="border-b border-surface-200 bg-surface-0 shadow-xs">
        <Container>
          <div className="flex h-16 items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-surface-600 transition-colors duration-fast hover:bg-surface-100 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
                <Activity size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-surface-900">{APP_NAME}</span>
            </Link>

            {/* Location Selector Placeholder */}
            <button
              type="button"
              className="hidden items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-2 text-sm transition-colors duration-fast hover:border-brand-300 hover:bg-brand-50 md:flex"
            >
              <MapPin size={14} className="text-brand-600" />
              <div className="text-left">
                <p className="text-[11px] font-medium leading-tight text-surface-500">Deliver to</p>
                <p className="text-xs font-semibold leading-tight text-surface-800">Select location</p>
              </div>
              <ChevronDown size={12} className="text-surface-400" />
            </button>

            {/* Search Bar */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search for medicines, wellness products, lab tests..."
                className="w-full rounded-lg border border-surface-300 bg-surface-50 py-2 pl-10 pr-4 text-sm outline-none transition-all duration-fast ease-smooth placeholder:text-surface-400 hover:bg-surface-0 focus:border-brand-500 focus:bg-surface-0 focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            {/* Account Menu & Cart */}
            <div className="flex items-center gap-2">
              {/* Account Dropdown */}
              <div className="relative hidden sm:block" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-fast",
                    accountMenuOpen
                      ? "bg-brand-50 text-brand-700"
                      : "text-surface-700 hover:bg-surface-100",
                  )}
                >
                  <User size={18} className={isAuthenticated ? "text-brand-600" : "text-surface-600"} />
                  <span className="hidden lg:inline">
                    {isAuthenticated ? (user?.fullName ?? "Account") : "Account"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-surface-400 transition-transform duration-fast",
                      accountMenuOpen && "rotate-180",
                    )}
                  />
                </button>

                {/* Dropdown */}
                {accountMenuOpen && (
                  <div className="absolute right-0 top-full z-dropdown mt-1 w-56 rounded-xl border border-surface-200 bg-surface-0 py-1 shadow-lg">
                    {isAuthenticated ? (
                      <>
                        {/* Authenticated user menu */}
                        <div className="border-b border-surface-100 px-4 py-3">
                          <p className="text-sm font-semibold text-surface-900">
                            {user?.fullName ?? "My Account"}
                          </p>
                          <p className="mt-0.5 text-xs text-surface-500">{user?.email}</p>
                        </div>

                        <AccountMenuItem
                          icon={<User size={15} />}
                          label="My Profile"
                          onClick={() => navigateAndClose("/profile")}
                        />
                        <AccountMenuItem
                          icon={<Package size={15} />}
                          label="My Orders"
                          onClick={() => navigateAndClose("/orders")}
                        />
                        <AccountMenuItem
                          icon={<ClipboardList size={15} />}
                          label="Prescriptions"
                          onClick={() => navigateAndClose("/prescriptions")}
                        />
                        <AccountMenuItem
                          icon={<Heart size={15} />}
                          label="Wishlist"
                          onClick={() => navigateAndClose("/wishlist")}
                        />
                        <AccountMenuItem
                          icon={<MapPin size={15} />}
                          label="My Addresses"
                          onClick={() => navigateAndClose("/addresses")}
                        />
                        <AccountMenuItem
                          icon={<Award size={15} />}
                          label="Rewards"
                          onClick={() => navigateAndClose("/rewards")}
                        />
                        <AccountMenuItem
                          icon={<Bell size={15} />}
                          label="Notifications"
                          onClick={() => navigateAndClose("/notifications")}
                        />
                        <AccountMenuItem
                          icon={<Settings size={15} />}
                          label="Settings"
                          onClick={() => navigateAndClose("/profile")}
                        />

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
                        {/* Guest menu */}
                        <div className="border-b border-surface-100 px-4 py-3">
                          <p className="text-sm font-semibold text-surface-900">
                            Welcome to {APP_NAME}
                          </p>
                          <p className="mt-0.5 text-xs text-surface-500">
                            Sign in to access your account
                          </p>
                        </div>

                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => navigateAndClose("/auth/login")}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-fast hover:bg-brand-700"
                          >
                            <LogOut size={15} />
                            Sign in
                          </button>
                          <button
                            type="button"
                            onClick={() => navigateAndClose("/auth/register")}
                            className="mt-2 flex w-full items-center justify-center rounded-lg border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-700 transition-colors duration-fast hover:bg-surface-50"
                          >
                            Create account
                          </button>
                        </div>

                        <div className="my-1 border-t border-surface-100" />

                        <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                          Quick links
                        </p>
                        <AccountMenuItem
                          icon={<Package size={15} />}
                          label="Track Order"
                          onClick={() => navigateAndClose("/auth/login")}
                        />
                        <AccountMenuItem
                          icon={<ClipboardList size={15} />}
                          label="Upload Prescription"
                          onClick={() => navigateAndClose("/auth/login")}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-surface-600 transition-colors duration-fast hover:bg-surface-100"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  0
                </span>
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Category Navigation */}
      <nav className="hidden border-b border-surface-100 bg-surface-0 lg:block">
        <Container>
          <div className="flex items-center gap-1 overflow-x-auto py-2.5">
            {commerceCategories.map((item: NavigationItem) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.path!}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all duration-fast ease-smooth",
                    "text-surface-600 hover:bg-brand-50 hover:text-brand-700",
                  )}
                >
                  <Icon size={14} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </Container>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-surface-200 bg-surface-0 shadow-lg lg:hidden">
          <nav className="mx-auto max-w-content space-y-1 px-4 py-4">
            {/* Mobile Location */}
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg border border-surface-200 px-3 py-2.5 text-sm"
            >
              <MapPin size={14} className="text-brand-600" />
              <span className="font-medium text-surface-700">Select delivery location</span>
            </button>

            {/* Mobile Auth */}
            {isAuthenticated ? (
              <>
                <div className="rounded-lg bg-brand-50 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                      {(user?.fullName ?? "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-900">{user?.fullName ?? "Account"}</p>
                      <p className="text-xs text-surface-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-surface-100 pt-1">
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                    Account
                  </p>
                  <MobileMenuItem icon={<User size={16} />} label="My Profile" onClick={() => navigateAndClose("/profile")} />
                  <MobileMenuItem icon={<Package size={16} />} label="My Orders" onClick={() => navigateAndClose("/orders")} />
                  <MobileMenuItem icon={<ClipboardList size={16} />} label="Prescriptions" onClick={() => navigateAndClose("/prescriptions")} />
                  <MobileMenuItem icon={<Heart size={16} />} label="Wishlist" onClick={() => navigateAndClose("/wishlist")} />
                  <MobileMenuItem icon={<MapPin size={16} />} label="My Addresses" onClick={() => navigateAndClose("/addresses")} />
                  <MobileMenuItem icon={<Award size={16} />} label="Rewards" onClick={() => navigateAndClose("/rewards")} />
                  <MobileMenuItem icon={<Bell size={16} />} label="Notifications" onClick={() => navigateAndClose("/notifications")} />
                </div>

                <div className="border-t border-surface-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50"
                  >
                    <LogOut size={16} />
                    <span>Log out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg bg-brand-50 p-3 text-center">
                  <p className="text-sm font-medium text-surface-700">
                    Sign in for a personalized experience
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigateAndClose("/auth/login")}
                      className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateAndClose("/auth/register")}
                      className="flex-1 rounded-lg border border-surface-200 px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-0"
                    >
                      Register
                    </button>
                  </div>
                </div>

                <div className="border-t border-surface-100 pt-1">
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                    Quick access
                  </p>
                  <MobileMenuItem icon={<Package size={16} />} label="Track Order" onClick={() => navigateAndClose("/auth/login")} />
                  <MobileMenuItem icon={<ClipboardList size={16} />} label="Upload Prescription" onClick={() => navigateAndClose("/auth/login")} />
                </div>
              </>
            )}

            {/* Mobile Categories */}
            <div className="border-t border-surface-100 pt-2">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-surface-400">
                Categories
              </p>
              {commerceCategories.map((item: NavigationItem) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.path!}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors duration-fast hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Icon size={16} className="text-surface-400" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ─── Sub-components ─── */

function AccountMenuItem({
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

function MobileMenuItem({
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
