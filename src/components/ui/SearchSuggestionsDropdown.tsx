/**
 * SearchSuggestionsDropdown
 *
 * Dropdown overlay for search suggestions with keyboard navigation.
 * Shows instant suggestions when typing, and recent/popular when idle.
 * Groups results by type (products, brands, categories, health concerns).
 */

import { forwardRef, useEffect, useImperativeHandle, useRef, useCallback, useState } from "react";
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
  visible: boolean;
}

export interface SearchSuggestionsDropdownHandle {
  activeIndex: number;
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

const SearchSuggestionsDropdown = forwardRef<
  SearchSuggestionsDropdownHandle,
  SearchSuggestionsDropdownProps
>(function SearchSuggestionsDropdown(
  {
    suggestions,
    recentSearches,
    popularSearches,
    isLoading,
    query,
    onSelect,
    onRemoveRecent,
    onClearRecent,
    visible,
  },
  ref,
) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Flatten all selectable items for keyboard navigation
  const items = buildItemList(suggestions, recentSearches, popularSearches, query);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Expose activeIndex to parent for screen reader announcements
  useImperativeHandle(ref, () => ({ activeIndex }), [activeIndex]);

  // Reset active index when items change
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions, recentSearches, popularSearches, query]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!visible) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % items.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < items.length) {
            const item = items[activeIndex];
            if (item.kind === "recent") {
              onSelect(item.text);
            } else if (item.kind === "popular") {
              onSelect(item.text);
            } else {
              onSelect(item.suggestion.text);
            }
          } else if (query.trim()) {
            onSelect(query);
          }
          break;
        case "Escape":
          e.preventDefault();
          onSelect(""); // signals close
          break;
      }
    },
    [visible, activeIndex, items, query, onSelect],
  );

  if (!visible) return null;

  const hasSuggestions = suggestions.length > 0;
  const hasIdleContent = !query && (recentSearches.length > 0 || popularSearches.length > 0);
  const showEmpty = query && !isLoading && !hasSuggestions;

  return (
    <div
      role="listbox"
      aria-label="Search suggestions"
      ref={listRef}
      onKeyDown={handleKeyDown}
      className="absolute left-0 top-full z-dropdown mt-1 w-full overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-lg"
    >
      {/* Loading indicator */}
      {isLoading && !hasSuggestions && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-surface-400">
          <Search size={14} className="animate-pulse" />
          Searching…
        </div>
      )}

      {/* Suggestion groups */}
      {hasSuggestions && (
        <div className="max-h-80 overflow-y-auto py-1" role="group" aria-label="Suggestions">
          {renderSuggestionGroups(suggestions, activeIndex, activeRef, (idx) => {
            setActiveIndex(idx);
            const item = items[idx];
            if (item.kind === "suggestion") onSelect(item.suggestion.text);
          })}
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
        <div className="py-1">
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
              {recentSearches.map((term) => {
                const itemIdx = items.findIndex((i) => i.kind === "recent" && i.text === term);
                return (
                  <button
                    key={term}
                    type="button"
                    role="option"
                    aria-selected={itemIdx === activeIndex}
                    ref={itemIdx === activeIndex ? activeRef : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                      itemIdx === activeIndex
                        ? "bg-brand-50 text-brand-700"
                        : "text-surface-700 hover:bg-surface-50",
                    )}
                    onClick={() => onSelect(term)}
                    onMouseEnter={() => setActiveIndex(itemIdx)}
                  >
                    <Clock size={14} className="shrink-0 text-surface-300" />
                    <span className="flex-1 text-left">{term}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove "${term}" from recent searches`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecent(term);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          onRemoveRecent(term);
                        }
                      }}
                      className="rounded p-0.5 text-surface-300 hover:text-surface-600"
                    >
                      <X size={12} />
                    </span>
                  </button>
                );
              })}
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
                    className="inline-flex items-center gap-1 rounded-full border border-surface-200 bg-surface-50 px-3 py-1 text-xs font-medium text-surface-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
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

type FlatItem =
  | { kind: "suggestion"; suggestion: SearchSuggestion; groupIdx: number }
  | { kind: "recent"; text: string }
  | { kind: "popular"; text: string };

function buildItemList(
  suggestions: SearchSuggestion[],
  recentSearches: string[],
  popularSearches: PopularSearch[],
  query: string,
): FlatItem[] {
  if (query) {
    return suggestions.map((s, i) => ({ kind: "suggestion" as const, suggestion: s, groupIdx: i }));
  }
  const items: FlatItem[] = [];
  for (const r of recentSearches) {
    items.push({ kind: "recent", text: r });
  }
  for (const p of popularSearches) {
    items.push({ kind: "popular", text: p.text });
  }
  return items;
}

function renderSuggestionGroups(
  suggestions: SearchSuggestion[],
  activeIndex: number,
  activeRef: React.RefObject<HTMLButtonElement | null>,
  onActivate: (idx: number) => void,
) {
  // Group by type
  const groups = new Map<SearchSuggestion["type"], SearchSuggestion[]>();
  for (const s of suggestions) {
    const list = groups.get(s.type) ?? [];
    list.push(s);
    groups.set(s.type, list);
  }

  const typeOrder: SearchSuggestion["type"][] = ["health_concern", "product", "brand", "category"];
  let globalIdx = 0;

  return typeOrder.map((type) => {
    const items_in_group = groups.get(type);
    if (!items_in_group || items_in_group.length === 0) return null;

    const meta = TYPE_META[type];
    const Icon = meta.icon;
    const startIdx = globalIdx;
    globalIdx += items_in_group.length;

    return (
      <div key={type} role="group" aria-label={meta.label}>
        <div className="flex items-center gap-2 px-4 pt-2 pb-1">
          <Icon size={12} className="text-surface-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
            {meta.label}
          </span>
        </div>
        {items_in_group.map((suggestion, localIdx) => {
          const flatIdx = startIdx + localIdx;
          return (
            <button
              key={suggestion.id}
              type="button"
              role="option"
              aria-selected={flatIdx === activeIndex}
              ref={flatIdx === activeIndex ? activeRef : undefined}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                flatIdx === activeIndex
                  ? "bg-brand-50 text-brand-700"
                  : "text-surface-700 hover:bg-surface-50",
              )}
              onClick={() => onActivate(flatIdx)}
              onMouseEnter={() => onActivate(flatIdx)}
            >
              <Icon size={14} className="shrink-0 text-surface-400" />
              <HighlightText
                text={suggestion.text}
                ranges={suggestion.highlightRanges}
                className="flex-1 text-left"
              />
            </button>
          );
        })}
      </div>
    );
  });
}

export default SearchSuggestionsDropdown;
