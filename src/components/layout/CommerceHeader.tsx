/**
 * CommerceHeader
 *
 * Scroll-aware global commerce header with three distinct layers:
 *   1. Announcement bar — scrolls away naturally (not sticky)
 *   2. Main navigation — sticky at the top (always accessible)
 *   3. Category navigation — sticky below the main nav (desktop only)
 *
 * Overlay architecture:
 *   - Mobile navigation: left-side Drawer (portal to body)
 *   - Profile menu: desktop dropdown (absolute) + mobile Drawer (portal)
 *   - Notification menu: desktop dropdown (absolute) + mobile Drawer (portal)
 *   - Cart: existing MiniCartDrawer (right-side Drawer, portal)
 *
 * All overlays close on: outside click, Escape, route change.
 * Height measurements are exposed as CSS custom properties via useScrollLayout.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  Bell,
  ChevronDown,
  MapPin,
  ShoppingCart,
  User,
} from "lucide-react";
import { commerceCategories, type NavigationItem } from "@/config/navigation";
import { ANNOUNCEMENT_TEXT, APP_NAME } from "@/config/constants";
import { cn } from "@/utils/cn";
import { cartDrawerEvents } from "@/utils/cartDrawerEvents";
import { Container } from "@/components/ui";
import { useAuth } from "@/hooks/auth";
import { useScrollLayout } from "@/hooks/layout";
import { useCart } from "@/hooks/shopping";
import { useUnreadNotificationCount } from "@/hooks/account";
import { MiniCartDrawer } from "@/components/cart";
import HeaderSearch from "./HeaderSearch";
import MobileNavigationDrawer from "./MobileNavigationDrawer";
import ProfileMenu from "./ProfileMenu";
import NotificationMenu from "./NotificationMenu";

export default function CommerceHeader() {
  const mainNavRef = useRef<HTMLElement>(null);
  const catNavRef = useRef<HTMLElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { totalItems } = useCart();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const pathname = useLocation().pathname;

  // Subscribe to external cart drawer open events (e.g. from toast actions)
  useEffect(() => {
    return cartDrawerEvents.subscribe(() => {
      setCartDrawerOpen(true);
    });
  }, []);

  // Layout measurement only — no mobile menu state
  useScrollLayout({
    mainNav: mainNavRef,
    catNav: catNavRef,
    announceBar: announceRef,
  });

  // Close mobile nav
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const handleMobileToggle = useCallback(() => {
    setMobileNavOpen((prev) => !prev);
  }, []);

  // Return focus to hamburger when mobile nav closes
  useEffect(() => {
    if (!mobileNavOpen) {
      menuToggleRef.current?.focus();
    }
  }, [mobileNavOpen]);

  // Close all overlays on route change.
  // Uses React's "storing information from previous renders" pattern:
  // state tracks the previous pathname; during render, detect changes and reset overlays.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileNavOpen(false);
    setProfileOpen(false);
    setNotificationOpen(false);
  }

  // Close overlays on Escape (top-level handler for buttons)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Only handle if a button has focus (dropdowns handle their own Escape when open)
      const active = document.activeElement;
      if (
        active === profileButtonRef.current ||
        active === notificationButtonRef.current ||
        active === menuToggleRef.current
      ) {
        setProfileOpen(false);
        setNotificationOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* ── Announcement Bar (scrolls away) ── */}
      <div ref={announceRef} className="bg-brand-600 px-4 py-2 text-center">
        <p className="text-xs font-medium text-white sm:text-sm">{ANNOUNCEMENT_TEXT}</p>
      </div>

      <header className="w-full">
        {/* ── Main Navigation (sticky at top) ── */}
        <nav
          ref={mainNavRef}
          className="sticky top-0 z-main-nav w-full border-b border-surface-200 bg-surface-0 shadow-xs"
        >
          <Container>
            <div className="flex h-16 items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                type="button"
                ref={menuToggleRef}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-surface-600 transition-colors duration-fast hover:bg-surface-100 lg:hidden"
                onClick={handleMobileToggle}
                aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileNavOpen}
                aria-controls="mobile-navigation-drawer"
              >
                {mobileNavOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                )}
              </button>

              {/* Logo */}
              <Link to="/" className="flex shrink-0 items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
                  <Activity size={18} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold tracking-tight text-surface-900">
                  {APP_NAME}
                </span>
              </Link>

              {/* Location Selector (desktop) */}
              <button
                type="button"
                aria-label="Select delivery location"
                className="hidden items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-2 text-sm transition-colors duration-fast hover:border-brand-300 hover:bg-brand-50 md:flex"
              >
                <MapPin size={14} className="text-brand-600" />
                <div className="text-left">
                  <p className="text-[11px] font-medium leading-tight text-surface-500">
                    Deliver to
                  </p>
                  <p className="text-xs font-semibold leading-tight text-surface-800">
                    Select location
                  </p>
                </div>
                <ChevronDown size={12} className="text-surface-400" />
              </button>

              {/* Search Bar */}
              <HeaderSearch />

              {/* Account, Notifications & Cart */}
              <div className="flex items-center gap-2">
                {/* Account — triggers ProfileMenu (desktop dropdown + mobile drawer) */}
                <button
                  type="button"
                  ref={profileButtonRef}
                  onClick={() => {
                    setProfileOpen((prev) => !prev);
                    setNotificationOpen(false);
                  }}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-fast",
                    profileOpen
                      ? "bg-brand-50 text-brand-700"
                      : "text-surface-700 hover:bg-surface-100",
                  )}
                >
                  <User
                    size={18}
                    className={isAuthenticated ? "text-brand-600" : "text-surface-600"}
                  />
                  <span className="hidden lg:inline">
                    {isAuthenticated ? (user?.fullName ?? "Account") : "Account"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-surface-400 transition-transform duration-fast",
                      profileOpen && "rotate-180",
                    )}
                  />
                </button>
                <ProfileMenu isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

                {/* Notifications */}
                <button
                  type="button"
                  ref={notificationButtonRef}
                  onClick={() => {
                    setNotificationOpen((prev) => !prev);
                    setProfileOpen(false);
                  }}
                  aria-expanded={notificationOpen}
                  aria-haspopup="true"
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-fast",
                    notificationOpen
                      ? "bg-brand-50 text-brand-700"
                      : "text-surface-600 hover:bg-surface-100",
                  )}
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-danger-600 text-[10px] font-bold text-white"
                      aria-hidden="true"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationMenu
                  isOpen={notificationOpen}
                  onClose={() => setNotificationOpen(false)}
                />

                {/* Cart */}
                <button
                  type="button"
                  onClick={() => setCartDrawerOpen(true)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg text-surface-600 transition-colors duration-fast hover:bg-surface-100"
                  aria-label="Shopping cart"
                  aria-haspopup="dialog"
                >
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white"
                      aria-hidden="true"
                    >
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </Container>
        </nav>

        {/* ── Category Navigation (sticky below main nav on desktop) ── */}
        <nav
          ref={catNavRef}
          className="sticky z-dropdown hidden w-full border-b border-surface-100 bg-surface-0 lg:block"
          style={{ top: "var(--layout-header-main-h)" }}
        >
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
      </header>

      {/* ── Overlays (all portal to body) ── */}
      <MobileNavigationDrawer
        isOpen={mobileNavOpen}
        onClose={closeMobileNav}
      />

      <MiniCartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
}
