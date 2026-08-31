/**
 * HeaderSearch
 *
 * Search input with instant suggestions for the commerce header.
 *
 * Responsive architecture:
 *   - Mobile (<md): A search icon button in the header row. Tapping it opens a
 *     full-width Popover *sheet* anchored directly below the sticky header.
 *     The sheet contains the search input at its top and suggestions below.
 *   - Desktop (md+): An inline input stretches across the available header space
 *     (unchanged). Suggestions appear in a standard Popover dropdown anchored
 *     to the input.
 *
 * Both modes share the same Zustand/React-Query hooks (debounced suggestions,
 * recent/popular searches, navigation) so there is no data duplication.
 *
 * Overlay concerns:
 *   - Both sheets and dropdowns use the shared `Popover` primitive (portal to
 *     body, `z-popover`, `position: fixed`). The `sheet` option is a new
 *     positioning mode of the shared primitive — not a separate implementation.
 *   - Mobile sheet closes on: outside tap, Escape, search icon tap, browser
 *     back (popstate), or suggestion selection.
 *   - Desktop dropdown closes on: outside tap, Escape, blur, or suggestion
 *     selection (unchanged).
 *   - Header layout is always stable — the icon/input swap at the `md` CSS
 *     breakpoint with no layout shift (both are sized to the same grid slot).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Popover, SearchSuggestionsDropdown, type SearchSuggestionsDropdownHandle } from "@/components/ui";
import {
  useSearchSuggestions,
  usePopularSearches,
  useRecentSearches,
} from "@/hooks/catalog";
import type { SearchSuggestion, PopularSearch } from "@/types/catalog";

/* ── Tiny responsive hook (matches Drawer.tsx pattern) ── */

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

/* ── Shared input rendered in both sheets and inline ── */

function SharedSearchInput({
  inputRef,
  input,
  onInput,
  onInputKeyDown,
  onFocus,
  placeholder,
  compact,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  input: string;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  placeholder: string;
  compact?: boolean;
}) {
  return (
    <div className="relative flex-1">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
        size={compact ? 14 : 16}
      />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        aria-label="Search"
        value={input}
        onChange={onInput}
        onFocus={onFocus}
        onKeyDown={onInputKeyDown}
        role="combobox"
        aria-autocomplete="list"
        className={`w-full rounded-lg border border-surface-300 bg-surface-50 py-2 pl-10 pr-4 text-sm outline-none transition-all duration-fast ease-smooth placeholder:text-surface-400 hover:bg-surface-0 focus:border-brand-500 focus:bg-surface-0 focus:ring-4 focus:ring-brand-500/10 ${
          compact ? "" : ""
        }`}
      />
    </div>
  );
}

export default function HeaderSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<SearchSuggestionsDropdownHandle>(null);

  const isMobile = useMediaQuery("(max-width: 767px)");

  const { data: suggestions = [], isLoading: suggestionsLoading } =
    useSearchSuggestions(input);
  const { data: popularSearches = [] } = usePopularSearches();
  const { recent, addRecent, removeRecent, clearRecent } = useRecentSearches();

  const handleSubmit = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      addRecent(trimmed);
      setOpen(false);
      setInput(trimmed);
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [addRecent, navigate],
  );

  const handleSelect = useCallback(
    (term: string) => handleSubmit(term),
    [handleSubmit],
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (input.trim()) handleSubmit(input);
      } else if (e.key === "ArrowDown" && open) {
        e.preventDefault();
        dropdownRef.current?.focusList(true);
      } else if (e.key === "ArrowUp" && open) {
        e.preventDefault();
        dropdownRef.current?.focusList(false);
      }
    },
    [open, input, handleSubmit],
  );

  const openMobileSearch = useCallback(() => {
    setOpen(true);
    // Focus the sheet input after the Popover mounts (rAF to wait for paint).
    requestAnimationFrame(() => mobileInputRef.current?.focus());
  }, []);

  const openDesktopSearch = useCallback(() => setOpen(true), []);

  // ── Mobile: close on browser back ──
  useEffect(() => {
    if (!open || !isMobile) return;
    const onPopState = () => setOpen(false);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [open, isMobile]);

  if (isMobile) {
    return (
      <MobileSearchSheet
        open={open}
        onToggle={openMobileSearch}
        onClose={() => setOpen(false)}
        input={input}
        onInput={(e) => setInput(e.target.value)}
        inputRef={mobileInputRef}
        buttonRef={mobileBtnRef}
        dropdownRef={dropdownRef}
        onInputKeyDown={handleInputKeyDown}
        onSelect={handleSelect}
        suggestions={suggestions}
        suggestionsLoading={suggestionsLoading}
        popularSearches={popularSearches}
        recentSearches={recent}
        onRemoveRecent={removeRecent}
        onClearRecent={clearRecent}
      />
    );
  }

  return (
    <DesktopSearchInline
      open={open}
      input={input}
      inputRef={inputRef}
      dropdownRef={dropdownRef}
      onInput={(e) => setInput(e.target.value)}
      onFocus={openDesktopSearch}
      onInputKeyDown={handleInputKeyDown}
      onSelect={handleSelect}
      onOpenChange={(next) => { if (!next) setOpen(false); }}
      suggestions={suggestions}
      suggestionsLoading={suggestionsLoading}
      popularSearches={popularSearches}
      recentSearches={recent}
      onRemoveRecent={removeRecent}
      onClearRecent={clearRecent}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Mobile Search Sheet — full-width Popover sheet below the header
   ═══════════════════════════════════════════════════════════════════════════ */

interface MobileSearchSheetProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  input: string;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  dropdownRef: React.RefObject<SearchSuggestionsDropdownHandle | null>;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelect: (term: string) => void;
  suggestions: SearchSuggestion[];
  suggestionsLoading: boolean;
  popularSearches: PopularSearch[];
  recentSearches: string[];
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
}

function MobileSearchSheet({
  open,
  onToggle,
  onClose,
  input,
  onInput,
  inputRef,
  buttonRef,
  dropdownRef,
  onInputKeyDown,
  onSelect,
  suggestions,
  suggestionsLoading,
  popularSearches,
  recentSearches,
  onRemoveRecent,
  onClearRecent,
}: MobileSearchSheetProps) {
  return (
    <>
      <div className="flex flex-1 items-center">
        <button
          type="button"
          ref={buttonRef}
          onClick={onToggle}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-surface-600 transition-colors duration-fast hover:bg-surface-100"
          aria-label="Open search"
          aria-expanded={open}
        >
          <Search size={20} />
        </button>
      </div>

      <Popover
        open={open}
        onOpenChange={(next) => { if (!next) onClose(); }}
        anchorRef={buttonRef}
        placement="bottom-start"
        offset={0}
        margin={0}
        flip={false}
        sheet
        role="listbox"
        ariaLabel="Search products"
        focusOnOpen={false}
      >
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3">
            <SharedSearchInput
              inputRef={inputRef}
              input={input}
              onInput={onInput}
              onInputKeyDown={onInputKeyDown}
              onFocus={() => {}}
              placeholder="Search for medicines, wellness products..."
              compact
            />
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-surface-500 transition-colors duration-fast hover:bg-surface-100 hover:text-surface-700"
            >
              Cancel
            </button>
          </div>
        </div>

        <SearchSuggestionsDropdown
          ref={dropdownRef}
          suggestions={suggestions}
          recentSearches={recentSearches}
          popularSearches={popularSearches}
          isLoading={suggestionsLoading}
          query={input}
          onSelect={onSelect}
          onRemoveRecent={onRemoveRecent}
          onClearRecent={onClearRecent}
        />
      </Popover>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Desktop Search — inline input + standard dropdown (unchanged behaviour)
   ═══════════════════════════════════════════════════════════════════════════ */

interface DesktopSearchInlineProps {
  open: boolean;
  input: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  dropdownRef: React.RefObject<SearchSuggestionsDropdownHandle | null>;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelect: (term: string) => void;
  onOpenChange: (open: boolean) => void;
  suggestions: SearchSuggestion[];
  suggestionsLoading: boolean;
  popularSearches: PopularSearch[];
  recentSearches: string[];
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
}

function DesktopSearchInline({
  open,
  input,
  inputRef,
  dropdownRef,
  onInput,
  onFocus,
  onInputKeyDown,
  onSelect,
  onOpenChange,
  suggestions,
  suggestionsLoading,
  popularSearches,
  recentSearches,
  onRemoveRecent,
  onClearRecent,
}: DesktopSearchInlineProps) {
  return (
    <>
      <SharedSearchInput
        inputRef={inputRef}
        input={input}
        onInput={onInput}
        onInputKeyDown={onInputKeyDown}
        onFocus={onFocus}
        placeholder="Search for medicines, wellness products, lab tests..."
      />

      <Popover
        open={open}
        onOpenChange={onOpenChange}
        anchorRef={inputRef}
        placement="bottom-start"
        role="listbox"
        ariaLabel="Search suggestions"
        matchTriggerWidth
        focusOnOpen={false}
      >
        <SearchSuggestionsDropdown
          ref={dropdownRef}
          suggestions={suggestions}
          recentSearches={recentSearches}
          popularSearches={popularSearches}
          isLoading={suggestionsLoading}
          query={input}
          onSelect={onSelect}
          onRemoveRecent={onRemoveRecent}
          onClearRecent={onClearRecent}
        />
      </Popover>
    </>
  );
}
