/**
 * Search hooks
 *
 * Read hooks over the catalog service layer for search functionality.
 * Includes debounced suggestions, URL-synced results, and
 * localStorage-persisted recent searches.
 */

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { services } from "@/services/factory";
import type { SearchQuery, CatalogSortOption, CatalogFilters, PriceRangeId } from "@/types/catalog";
import { emptyCatalogFilters } from "@/types/catalog";
import { useDebounce } from "@/hooks/common/useDebounce";
import { CATALOG_PAGE_SIZE } from "@/config/constants";

const catalogService = services.catalog;
const RECENT_SEARCHES_KEY = "keemeds-recent-searches";
const MAX_RECENT_SEARCHES = 10;

/* ── Instant Suggestions ── */

export function useSearchSuggestions(q: string) {
  const debounced = useDebounce(q, 200);
  return useQuery({
    queryKey: ["catalog", "suggestions", debounced],
    queryFn: () => catalogService.getSearchSuggestions(debounced),
    enabled: debounced.trim().length >= 2,
    staleTime: 60_000,
  });
}

/* ── Full Search Results (URL-synced) ── */

const VALID_RX_VALUES: ReadonlySet<string> = new Set(["any", "rx_only", "otc_only"]);

/**
 * Decode catalog filter state from a URLSearchParams object. Only recognized
 * values are ever returned — malformed/stale params (e.g. a bookmarked
 * `rx=foo`) are silently dropped so the UI never shows an inconsistent
 * "active filter that is actually empty" state.
 */
export function filtersFromSearchParams(searchParams: URLSearchParams): CatalogFilters {
  const brands = searchParams.get("brands");
  const manufacturers = searchParams.get("manufacturers");
  const priceRanges = searchParams.get("priceRanges");
  const rx = searchParams.get("rx");
  const prescription: CatalogFilters["prescription"] =
    rx !== null && VALID_RX_VALUES.has(rx) ? (rx as CatalogFilters["prescription"]) : "any";
  const inStockOnly = searchParams.get("inStock") === "1";
  const minDiscount = Math.max(0, Number(searchParams.get("discount")) || 0);
  return {
    ...emptyCatalogFilters(),
    brands: brands ? brands.split(",").filter(Boolean) : [],
    manufacturers: manufacturers ? manufacturers.split(",").filter(Boolean) : [],
    priceRanges: priceRanges
      ? priceRanges.split(",").filter(
          (id): id is PriceRangeId =>
            id === "under_5" || id === "5_to_10" || id === "10_to_25" || id === "above_25",
        )
      : [],
    prescription,
    inStockOnly,
    minDiscountPercent: minDiscount,
  };
}

/** Write a single search-param key, dropping falsy/identity values and
 *  resetting to page 1 whenever anything other than the page itself changes. */
export type SetFilterParam = (key: string, value: string | null) => void;

/** Push a full catalog filter state into the URL. Used by both the search
 *  results page and the category catalog page so the popup filter keeps the
 *  same URL encoding everywhere. */
export function applyFilterParams(setParam: SetFilterParam, next: CatalogFilters) {
  setParam("brands", next.brands.length > 0 ? next.brands.join(",") : null);
  setParam("manufacturers", next.manufacturers.length > 0 ? next.manufacturers.join(",") : null);
  setParam("rx", next.prescription !== "any" ? next.prescription : null);
  setParam("inStock", next.inStockOnly ? "1" : null);
  setParam("discount", next.minDiscountPercent > 0 ? String(next.minDiscountPercent) : null);
  setParam("priceRanges", next.priceRanges.length > 0 ? next.priceRanges.join(",") : null);
}

/** URL-backed filter + pagination state shared by searching and category
 *  browsing. Keeping filters in the URL makes them survive navigation, browser
 *  back/forward, bookmarks, and page reloads. */
export function useFilterSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const setParam: SetFilterParam = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === null || value === "" || value === "0" || value === "popularity") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        // Reset to page 1 when query or filters change (but not on page change)
        if (key !== "page") next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  return { filters, page, setParam, searchParams, setSearchParams };
}

export function useSearchState() {
  const { filters, page, setParam, searchParams, setSearchParams } = useFilterSearchParams();

  const q = searchParams.get("q") ?? "";
  const sortBy = (searchParams.get("sort") as CatalogSortOption) ?? "popularity";

  const query: SearchQuery = useMemo(
    () => ({ q, sortBy, filters, page, pageSize: CATALOG_PAGE_SIZE }),
    [q, sortBy, filters, page],
  );

  return { q, sortBy, filters, page, query, setParam, setSearchParams };
}

export function useSearchResults(query: SearchQuery) {
  return useQuery({
    queryKey: ["catalog", "search", query],
    queryFn: () => catalogService.searchProducts(query),
    placeholderData: (prev) => prev,
    enabled: query.q.trim().length > 0,
  });
}

/* ── Popular Searches ── */

export function usePopularSearches() {
  return useQuery({
    queryKey: ["catalog", "popular-searches"],
    queryFn: () => catalogService.getPopularSearches(),
    staleTime: 300_000,
  });
}

/* ── Health Concerns ── */

export function useHealthConcerns() {
  return useQuery({
    queryKey: ["catalog", "health-concerns"],
    queryFn: () => catalogService.getHealthConcerns(),
    staleTime: 300_000,
  });
}

/* ── Recent Searches (localStorage) ── */

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeRecent(items: string[]) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
  } catch {
    // silently ignore
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(readRecent);

  const addRecent = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
      writeRecent(next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((term: string) => {
    setRecent((prev) => {
      const next = prev.filter((s) => s !== term);
      writeRecent(next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    writeRecent([]);
  }, []);

  return { recent, addRecent, removeRecent, clearRecent };
}
