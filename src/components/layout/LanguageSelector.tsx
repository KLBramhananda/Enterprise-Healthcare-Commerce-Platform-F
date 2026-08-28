/**
 * LanguageSelector
 *
 * UI-only language selector for the global header (desktop dropdown).
 *
 * This component is intentionally wired exactly like the working ProfileMenu
 * and NotificationMenu so it shares the identical Popover pattern:
 *   - Open state is owned by the parent (CommerceHeader) via `isOpen`.
 *   - The Popover only ever reports *close* (`onOpenChange` -> `onClose`).
 *   - Content is static children whose action handler calls `onClose`.
 *   - The anchor button lives in the header (like the account/bell buttons)
 *     and is passed in via `anchorRef`.
 *
 * The option list is exported separately (`LanguageOptionList`) so the mobile
 * navigation drawer can reuse it without a nested dropdown.
 */

import type { RefObject } from "react";
import { Check } from "lucide-react";
import { LANGUAGES, type LanguageOption } from "@/config/languages";
import { useLanguageStore } from "@/store/languageStore";
import { Popover } from "@/components/ui";

/**
 * Reusable option list. Shared by the desktop dropdown and the mobile drawer.
 */
export function LanguageOptionList({
  onSelect,
}: {
  onSelect?: () => void;
}) {
  const locale = useLanguageStore((s) => s.locale);
  const setLocale = useLanguageStore((s) => s.setLocale);

  const handleSelect = (code: string) => {
    setLocale(code);
    onSelect?.();
  };

  return (
    <>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          role="option"
          aria-selected={locale === lang.code}
          onClick={() => handleSelect(lang.code)}
          className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors duration-fast hover:bg-brand-50"
        >
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="font-semibold text-surface-900">{lang.nativeName}</span>
            {lang.nativeName !== lang.name && (
              <span className="truncate text-xs text-surface-400">{lang.name}</span>
            )}
          </span>
          {locale === lang.code && (
            <Check size={16} className="shrink-0 text-brand-600" aria-hidden="true" />
          )}
        </button>
      ))}
    </>
  );
}

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  /** Anchor element (the header language button) for the desktop popover. */
  anchorRef?: RefObject<HTMLButtonElement | null>;
}

export default function LanguageSelector({
  isOpen,
  onClose,
  anchorRef,
}: LanguageSelectorProps) {
  return (
    <Popover
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      anchorRef={anchorRef}
      placement="bottom-end"
      role="listbox"
      ariaLabel="Choose language"
      className="hidden w-56 py-1.5 md:block"
    >
      <LanguageOptionList onSelect={onClose} />
    </Popover>
  );
}

export type { LanguageOption };
