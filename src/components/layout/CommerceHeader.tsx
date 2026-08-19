/**
 * CommerceHeader
 *
 * Top commerce header with announcement bar, branding, search, auth, and category navigation.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  MapPin,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { commerceCategories, type NavigationItem } from "@/config/navigation";
import { ANNOUNCEMENT_TEXT, APP_NAME } from "@/config/constants";
import { cn } from "@/utils/cn";

export default function CommerceHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Announcement Bar */}
      <div className="bg-emerald-600 px-4 py-2 text-center">
        <p className="text-xs font-medium text-white sm:text-sm">{ANNOUNCEMENT_TEXT}</p>
      </div>

      {/* Main Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">{APP_NAME}</span>
          </Link>

          {/* Location Selector Placeholder */}
          <button
            type="button"
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 md:flex"
          >
            <MapPin size={14} className="text-emerald-600" />
            <div className="text-left">
              <p className="text-[11px] font-medium leading-tight text-slate-500">Deliver to</p>
              <p className="text-xs font-semibold leading-tight text-slate-800">Select location</p>
            </div>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {/* Search Bar */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search for medicines, wellness products, lab tests..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* Auth & Cart */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 sm:flex"
            >
              <User size={18} className="text-slate-600" />
              <span className="hidden lg:inline">Login / Register</span>
            </button>

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <nav className="hidden border-b border-slate-100 bg-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2.5 lg:px-6">
          {commerceCategories.map((item: NavigationItem) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.path!}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all",
                  "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700",
                )}
              >
                <Icon size={14} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white shadow-lg lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {/* Mobile Location */}
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            >
              <MapPin size={14} className="text-emerald-600" />
              <span className="font-medium text-slate-700">Select delivery location</span>
            </button>

            {/* Mobile Auth */}
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <User size={16} />
              <span>Login / Register</span>
            </button>

            {/* Mobile Categories */}
            <div className="border-t border-slate-100 pt-2">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Categories
              </p>
              {commerceCategories.map((item: NavigationItem) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.path!}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Icon size={16} className="text-slate-400" />
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
