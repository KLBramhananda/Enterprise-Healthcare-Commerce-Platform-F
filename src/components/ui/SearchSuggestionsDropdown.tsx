/**
 * SearchSuggestionsDropdown
 *
 * Presentational panel for search suggestions with keyboard navigation.
 * Shows instant suggestions when typing, and recent/popular when idle.
 * Groups results by type (products, brands, categories, health concerns).
 *
 * Overlay concern: this component no longer positions itself. All floating
 * behaviour (portal mounting, `position: fixed`, viewport clamping, outside
 * click, Escape, focus management, Arrow/Home/End navigation) is delegated to
 * the shared `Popover` primitive in `HeaderSearch`, exactly like the Profile
 * and Notification menus. Keyboard navigation works by moving actual DOM focus
 * between the option buttons (the shared Popover handles Arrow/Home/End); this
 * component only exposes `focusList()` so the owning input can move focus into
 * the list (ArrowDown) or to the last item (ArrowUp).
 */

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";
import {
  Clock,
  Flame,
  HeartPulse,
  Package,
  Search,
  Tag,
  X,
} from "lucide-react";
import type { SearchSuggestion, PopularSearch } from "@/types/catalog";
import HighlightText from "./HighlightText";
import { cn } from "@/utils/cn";

export interface SearchSuggestionsDropdownProps {
  suggestions: SearchSuggestion[];
  recentSearches: string[];
  popularSearches: PopularSearch[];
  isLoading: boolean;
  query: string;
  onSelect: (term: string) => void;
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
}

export interface SearchSuggestionsDropdownHandle {
  /** Move focus into the list: true → first option, false → last option. */
  focusList: (first?: boolean) => void;
}

const TYPE_META: Record<
  SearchSuggestion["type"],
  { icon: typeof Package; label: string }
> = {
  product: { icon: Package, label: "Products" },
  brand: { icon: Tag, label: "Brands" },
  category: { icon: Tag, label: "Categories" },
  health_concern: { icon: HeartPulse, label: "Health Concerns" },
};

const OPTION_BASE =
  "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors";

const SearchSuggestionsDropdown = forwardRef<
  SearchSuggestionsDropdownHandle,
  SearchSuggestionsDropdownProps
>(function SearchSuggestionsDropdown(
  { suggestions, recentSearches, popularSearches, isLoading, query, onSelect, onRemoveRecent, onClearRecent },
  ref,
) {
  const listRef = useRef<HTMLDivElement>(null);

  // Expose a way for HeaderSearch to move keyboard focus into the list from
  // the input (ArrowDown / ArrowUp).
  useImperativeHandle(ref, () => ({
    focusList: (first = true) => {
      const focusables = listRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const target = first ? focusables[0] : focusables[focusables.length - 1];
      target.focus({ preventScroll: true });
    },
  }), []);

  const hasSuggestions = suggestions.length > 0;
  const hasIdleContent = !query && (recentSearches.length > 0 || popularSearches.length > 0);
  const showEmpty = query && !isLoading && !hasSuggestions;

  return (
    <div role="listbox" aria-label="Search suggestions" ref={listRef} className="py-1">
      {/* Loading indicator */}
      {isLoading && !hasSuggestions && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-surface-400">
          <Search size={14} className="animate-pulse" />
          Searching…
        </div>
      )}

      {/* Suggestion groups */}
      {hasSuggestions && (
        <div className="max-h-80 overflow-y-auto" role="group" aria-label="Suggestions">
          {renderSuggestionGroups(suggestions, onSelect)}
        </div>
      )}

      {/* No results */}
      {showEmpty && (
        <div className="px-4 py-6 text-center">
          <p className="text-sm font-medium text-surface-700">No results for &ldquo;{query}&rdquo;</p>
          <p className="mt-1 text-xs text-surface-400">Try a different search term or browse categories</p>
        </div>
      )}

      {/* Idle: recent + popular */}
      {hasIdleContent && (
        <div>
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 pt-2 pb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={onClearRecent}
                  className="text-[11px] font-medium text-brand-600 hover:text-brand-700"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((term) => (
                <div
                  key={term}
                  role="option"
                  className="flex w-full items-center"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(term)}
                    className={cn(OPTION_BASE, "text-surface-700 hover:bg-brand-50 hover:text-brand-700 focus:bg-brand-50 focus:text-brand-700 focus:outline-none")}
                  >
                    <Clock size={14} className="shrink-0 text-surface-300" />
                    <span className="flex-1 text-left">{term}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove "${term}" from recent searches`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRecent(term);
                    }}
                    className="mr-2 rounded p-0.5 text-surface-300 hover:text-surface-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {popularSearches.length > 0 && (
            <div>
              <div className="px-4 pt-2 pb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                  Popular Searches
                </span>
              </div>
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {popularSearches.map((item) => (
                  <button
                    key={item.text}
                    type="button"
                    onClick={() => onSelect(item.text)}
                    className="inline-flex items-center gap-1 rounded-full border border-surface-200 bg-surface-50 px-3 py-1 text-xs font-medium text-surface-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus:border-brand-200 focus:bg-brand-50 focus:text-brand-700 focus:outline-none"
                  >
                    <Flame size={10} className="text-warning-500" />
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

/* ── Internal helpers ── */

function renderSuggestionGroups(
  suggestions: SearchSuggestion[],
  onSelect: (term: string) => void,
): ReactNode[] {
  // Group by type
  const groups = new Map<SearchSuggestion["type"], SearchSuggestion[]>();
  for (const s of suggestions) {
    const list = groups.get(s.type) ?? [];
    list.push(s);
    groups.set(s.type, list);
  }

  const typeOrder: SearchSuggestion["type"][] = ["health_concern", "product", "brand", "category"];

  return typeOrder.map((type) => {
    const items_in_group = groups.get(type);
    if (!items_in_group || items_in_group.length === 0) return null;

    const meta = TYPE_META[type];
    const Icon = meta.icon;

    return (
      <div key={type} role="group" aria-label={meta.label}>
        <div className="flex items-center gap-2 px-4 pt-2 pb-1">
          <Icon size={12} className="text-surface-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
            {meta.label}
          </span>
        </div>
        {items_in_group.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            role="option"
            onClick={() => onSelect(suggestion.text)}
            className={cn(OPTION_BASE, "text-surface-700 hover:bg-brand-50 hover:text-brand-700 focus:bg-brand-50 focus:text-brand-700 focus:outline-none")}
          >
            <Icon size={14} className="shrink-0 text-surface-400" />
            <HighlightText
              text={suggestion.text}
              ranges={suggestion.highlightRanges}
              className="flex-1 text-left"
            />
          </button>
        ))}
      </div>
    );
  });
}

export default SearchSuggestionsDropdown;
