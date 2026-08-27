/**
 * MobileNavigationDrawer
 *
 * Full-height left-side drawer for mobile navigation.
 * Renders via React Portal (through Drawer) to escape any stacking context.
 * Contains only: delivery location selection and product category navigation.
 * Account-related items are accessible via the Profile menu (hamburger → account icon).
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ChevronDown, Globe, HelpCircle, MapPin, X } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { APP_NAME } from "@/config/constants";
import { getLanguageOption } from "@/config/languages";
import { commerceCategories, type NavigationItem } from "@/config/navigation";
import { useLanguageStore } from "@/store/languageStore";
import { cn } from "@/utils/cn";
import { LanguageOptionList } from "./LanguageSelector";

interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavigationDrawer({
  isOpen,
  onClose,
}: MobileNavigationDrawerProps) {
  const locale = useLanguageStore((s) => s.locale);
  const currentLanguage = getLanguageOption(locale);
  const [languageOpen, setLanguageOpen] = useState(false);

  const drawerHeader = (
    <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4">
      <Link to="/" onClick={onClose} className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Activity size={18} strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold text-surface-900">{APP_NAME}</span>
      </Link>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
        aria-label="Close menu"
      >
        <X size={20} />
      </button>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} side="left" header={drawerHeader}>
      <div className="space-y-1 p-4">
        {/* Delivery Location */}
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg border border-surface-200 px-3 py-3 text-sm transition-colors duration-fast hover:border-brand-300 hover:bg-brand-50"
        >
          <MapPin size={16} className="text-brand-600" />
          <div className="text-left">
            <p className="text-[11px] font-medium leading-tight text-surface-500">
              Deliver to
            </p>
            <p className="text-sm font-semibold leading-tight text-surface-800">
              Select delivery location
            </p>
          </div>
        </button>

        {/* Need Help? */}
        <Link
          to="/help"
          onClick={onClose}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium text-surface-600 transition-colors duration-fast hover:bg-brand-50 hover:text-brand-700"
        >
          <HelpCircle size={16} className="text-brand-600" />
          <span>Need Help?</span>
        </Link>

        {/* Language selector */}
        <div className="rounded-lg border border-surface-200">
          <button
            type="button"
            onClick={() => setLanguageOpen((prev) => !prev)}
            aria-expanded={languageOpen}
            className="flex w-full items-center justify-between gap-2.5 px-3 py-3 text-sm transition-colors duration-fast hover:bg-brand-50"
          >
            <span className="flex items-center gap-2.5 font-medium text-surface-600">
              <Globe size={16} className="text-brand-600" />
              Language
            </span>
            <span className="flex items-center gap-2 text-surface-800">
              <span className="text-sm font-semibold">{currentLanguage.nativeName}</span>
              <ChevronDown
                size={15}
                className={cn(
                  "text-surface-400 transition-transform duration-fast",
                  languageOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </span>
          </button>
          {languageOpen && (
            <div className="border-t border-surface-100 p-2">
              <LanguageOptionList onSelect={() => setLanguageOpen(false)} />
            </div>
          )}
        </div>

        {/* Categories */}
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
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 transition-colors duration-fast hover:bg-brand-50 hover:text-brand-700"
              >
                <Icon size={16} className="text-surface-400" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
}
