/**
 * HeaderSearch
 *
 * Search input with instant suggestions for the commerce header.
 *
 * Overlay architecture:
 *   - The suggestion panel is rendered by the shared `Popover` primitive in
 *     `anchorRef` mode, anchored to the search input. Popover portals the panel
 *     to `document.body` at the `z-popover` layer and positions it with
 *     `useFloatingPosition`, so it is always visible above the Category
 *     Navigation, Hero section, and every page component — the same enterprise
 *     pattern used by the Profile and Notification menus.
 *   - Collapsing the focus/blur/outside-click/Escape into the shared Popover
 *     replaces the previous fragile `onBlur`-timeout absolute-positioned
 *     dropdown.
 *   - Manages local input state, debounced suggestions, keyboard navigation
 *     (ArrowDown/Up enter the list; Enter selects), recent/popular searches,
 *     and navigation to the search results page.
 */

import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Popover, SearchSuggestionsDropdown, type SearchSuggestionsDropdownHandle } from "@/components/ui";
import {
  useSearchSuggestions,
  usePopularSearches,
  useRecentSearches,
} from "@/hooks/catalog";

export default function HeaderSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<SearchSuggestionsDropdownHandle>(null);

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
        // Move keyboard focus into the suggestion list.
        e.preventDefault();
        dropdownRef.current?.focusList(true);
      } else if (e.key === "ArrowUp" && open) {
        e.preventDefault();
        dropdownRef.current?.focusList(false);
      }
    },
    [open, input, handleSubmit],
  );

  return (
    <>
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
          size={16}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for medicines, wellness products, lab tests..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          className="w-full rounded-lg border border-surface-300 bg-surface-50 py-2 pl-10 pr-4 text-sm outline-none transition-all duration-fast ease-smooth placeholder:text-surface-400 hover:bg-surface-0 focus:border-brand-500 focus:bg-surface-0 focus:ring-4 focus:ring-brand-500/10"
        />
      </div>

      <Popover
        open={open}
        onOpenChange={(next) => {
          if (!next) setOpen(false);
        }}
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
          recentSearches={recent}
          popularSearches={popularSearches}
          isLoading={suggestionsLoading}
          query={input}
          onSelect={handleSelect}
          onRemoveRecent={removeRecent}
          onClearRecent={clearRecent}
        />
      </Popover>
    </>
  );
}
