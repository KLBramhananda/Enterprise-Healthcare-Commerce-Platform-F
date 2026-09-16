/**
 * AccountSidebar
 *
 * Vertical navigation for the customer account center.
 * - Desktop (lg+): sticky sidebar column rendered alongside the content area.
 * - Mobile/Tablet (<lg): horizontal scrollable tab strip above the content.
 *
 * It is purely a navigation surface — it never embeds page content.
 */

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Package,
  MapPin,
  ClipboardList,
  Heart,
  Tag,
  Ticket,
  Sparkles,
  Shield,
  Headphones,
  LogOut,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/auth";

const ACCOUNT_LINKS = [
  {
    section: "Overview",
    items: [
      { to: "/account/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/account/profile", icon: User, label: "Profile" },
    ],
  },
  {
    section: "Orders & Deliveries",
    items: [
      { to: "/account/orders", icon: Package, label: "Orders" },
      { to: "/account/addresses", icon: MapPin, label: "Addresses" },
      { to: "/account/prescriptions", icon: ClipboardList, label: "Prescriptions" },
    ],
  },
  {
    section: "Shopping",
    items: [
      { to: "/account/wishlist", icon: Heart, label: "Wishlist" },
      { to: "/account/coupons", icon: Ticket, label: "Coupons" },
      { to: "/account/offers", icon: Tag, label: "Offers & Deals" },
    ],
  },
  {
    section: "Engagement",
    items: [
      { to: "/account/membership", icon: Sparkles, label: "Membership" },
    ],
  },
  {
    section: "Account",
    items: [
      { to: "/account/security", icon: Shield, label: "Security" },
      { to: "/help", icon: Headphones, label: "Help Center" },
    ],
  },
];

interface AccountSidebarProps {
  className?: string;
}

export default function AccountSidebar({ className }: AccountSidebarProps) {
  const { logout } = useAuth();

  return (
    <nav aria-label="Account navigation" className={cn("w-full", className)}>
      <div className="flex flex-row gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {ACCOUNT_LINKS.map((group) => (
          <div key={group.section} className="contents lg:block">
            <p className="hidden px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400 lg:block">
              {group.section}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/account/dashboard"}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-fast",
                    isActive
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-surface-600 hover:bg-surface-100 hover:text-brand-700",
                  )
                }
              >
                <item.icon size={16} className="shrink-0 opacity-80" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 hidden border-t border-surface-200 pt-4 lg:block">
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-600 transition-colors duration-fast hover:bg-danger-50"
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </nav>
  );
}