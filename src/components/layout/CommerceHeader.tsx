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
  Globe,
  HelpCircle,
  MapPin,
  ShoppingCart,
  User,
} from "lucide-react";
import { commerceCategories, type NavigationItem } from "@/config/navigation";
import { APP_NAME } from "@/config/constants";
import { getLanguageOption } from "@/config/languages";
import { findLocationById } from "@/config/locations";
import { useLanguageStore } from "@/store/languageStore";
import { useLocationStore } from "@/store/locationStore";
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
import AnnouncementTicker from "./AnnouncementTicker";
import LanguageSelector from "./LanguageSelector";
import LocationSelector from "./LocationSelector";

export default function CommerceHeader() {
  const mainNavRef = useRef<HTMLElement>(null);
  const catNavRef = useRef<HTMLElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const locale = useLanguageStore((s) => s.locale);
  const currentLanguage = getLanguageOption(locale);
  const locationId = useLocationStore((s) => s.locationId);
  const currentLocation = findLocationById(locationId);
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
    setLanguageOpen(false);
    setLocationOpen(false);
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
        active === languageButtonRef.current ||
        active === menuToggleRef.current ||
        active === locationButtonRef.current
      ) {
        setProfileOpen(false);
        setNotificationOpen(false);
        setLanguageOpen(false);
        setLocationOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* ── Announcement Bar (scrolling ticker, scrolls away) ── */}
      <div ref={announceRef}>
        <AnnouncementTicker />
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
                ref={locationButtonRef}
                onClick={() => {
                  setLocationOpen((prev) => !prev);
                  setProfileOpen(false);
                  setNotificationOpen(false);
                  setLanguageOpen(false);
                }}
                aria-expanded={locationOpen}
                aria-haspopup="listbox"
                aria-label="Select delivery location"
                className={cn(
                  "hidden items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-2 text-sm transition-colors duration-fast md:flex",
                  locationOpen
                    ? "border-brand-300 bg-brand-50"
                    : "hover:border-brand-300 hover:bg-brand-50",
                )}
              >
                <MapPin size={14} className="text-brand-600" />
                <div className="text-left">
                  <p className="text-[11px] font-medium leading-tight text-surface-500">
                    Deliver to
                  </p>
                  <p className="max-w-[10rem] truncate text-xs font-semibold leading-tight text-surface-800">
                    {currentLocation?.name ?? "Select location"}
                  </p>
                </div>
                <ChevronDown
                  size={12}
                  className={cn(
                    "text-surface-400 transition-transform duration-fast",
                    locationOpen && "rotate-180",
                  )}
                />
              </button>
              <LocationSelector
                isOpen={locationOpen}
                onClose={() => setLocationOpen(false)}
                anchorRef={locationButtonRef}
              />

              {/* Search Bar */}
              <HeaderSearch />

              {/* Account, Notifications & Cart */}
              <div className="flex items-center gap-2">
                {/* Language Selector (desktop) */}
                <button
                  type="button"
                  ref={languageButtonRef}
                  onClick={() => {
                    setLanguageOpen((prev) => !prev);
                    setProfileOpen(false);
                    setNotificationOpen(false);
                    setLocationOpen(false);
                  }}
                  aria-expanded={languageOpen}
                  aria-haspopup="listbox"
                  aria-label="Select language"
                  className={cn(
                    "hidden h-10 items-center gap-1.5 rounded-lg border border-surface-200 px-3 text-sm transition-colors duration-fast md:flex",
                    languageOpen
                      ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "text-surface-700 hover:border-brand-300 hover:bg-brand-50",
                  )}
                >
                  <Globe size={15} className="text-brand-600" aria-hidden="true" />
                  <span className="text-xs font-medium text-surface-700">{currentLanguage.nativeName}</span>
                  <ChevronDown
                    size={13}
                    className={cn(
                      "text-surface-400 transition-transform duration-fast",
                      languageOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
                <LanguageSelector
                  isOpen={languageOpen}
                  onClose={() => setLanguageOpen(false)}
                  anchorRef={languageButtonRef}
                />

                {/* Need Help? quick link (desktop/tablet; mobile lives in nav drawer) */}
                <Link
                  to="/help"
                  className="hidden h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-surface-600 transition-colors duration-fast hover:bg-surface-100 hover:text-brand-700 md:flex"
                >
                  <HelpCircle size={15} className="-ml-0.5 text-surface-400" aria-hidden="true" />
                  Need Help?
                </Link>

                {/* Account — triggers ProfileMenu (desktop dropdown + mobile drawer) */}
                <button
                  type="button"
                  ref={profileButtonRef}
                  onClick={() => {
                    setProfileOpen((prev) => !prev);
                    setNotificationOpen(false);
                    setLanguageOpen(false);
                    setLocationOpen(false);
                  }}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-fast",
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
                <ProfileMenu
                  isOpen={profileOpen}
                  onClose={() => setProfileOpen(false)}
                  anchorRef={profileButtonRef}
                />

                {/* Notifications */}
                <button
                  type="button"
                  ref={notificationButtonRef}
                  onClick={() => {
                    setNotificationOpen((prev) => !prev);
                    setProfileOpen(false);
                    setLanguageOpen(false);
                    setLocationOpen(false);
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
                  anchorRef={notificationButtonRef}
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
