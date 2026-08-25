/**
 * HeaderSearch
 *
 * Search input with instant suggestions dropdown for the commerce header.
 * Manages local input state, debounced suggestions, keyboard navigation,
 * recent/popular searches, and navigation to the search results page.
 */

import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  SearchSuggestionsDropdown,
  type SearchSuggestionsDropdownHandle,
} from "@/components/ui";
import {
  useSearchSuggestions,
  usePopularSearches,
  useRecentSearches,
} from "@/hooks/catalog";

export default function HeaderSearch() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const dropdownRef = useRef<SearchSuggestionsDropdownHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [], isLoading: suggestionsLoading } =
    useSearchSuggestions(input);
  const { data: popularSearches = [] } = usePopularSearches();
  const { recent, addRecent, removeRecent, clearRecent } = useRecentSearches();

  const showDropdown = focused;

  const handleSubmit = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      addRecent(trimmed);
      setFocused(false);
      setInput(trimmed);
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [addRecent, navigate],
  );

  const handleSelect = useCallback(
    (term: string) => {
      if (!term) {
        // Escape pressed — close dropdown
        setFocused(false);
        return;
      }
      handleSubmit(term);
    },
    [handleSubmit],
  );

  const handleBlur = useCallback(() => {
    // Delay to allow click on dropdown items
    setTimeout(() => setFocused(false), 150);
  }, []);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
        size={16}
      />
      <input
        type="text"
        placeholder="Search for medicines, wellness products, lab tests..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) {
            handleSubmit(input);
          }
        }}
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls="header-search-listbox"
        className="w-full rounded-lg border border-surface-300 bg-surface-50 py-2 pl-10 pr-4 text-sm outline-none transition-all duration-fast ease-smooth placeholder:text-surface-400 hover:bg-surface-0 focus:border-brand-500 focus:bg-surface-0 focus:ring-4 focus:ring-brand-500/10"
      />
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
        visible={showDropdown}
      />
    </div>
  );
}
