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
import type { SearchQuery, CatalogSortOption, CatalogFilters } from "@/types/catalog";
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

export function useSearchState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const sortBy = (searchParams.get("sort") as CatalogSortOption) ?? "popularity";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const filters: CatalogFilters = useMemo(() => {
    const brands = searchParams.get("brands");
    const prescription = searchParams.get("rx") as CatalogFilters["prescription"] | null;
    const inStockOnly = searchParams.get("inStock") === "1";
    const minDiscount = Number(searchParams.get("discount")) || 0;
    return {
      ...emptyCatalogFilters(),
      brands: brands ? brands.split(",") : [],
      prescription: prescription ?? "any",
      inStockOnly,
      minDiscountPercent: minDiscount,
    };
  }, [searchParams]);

  const setParam = useCallback(
    (key: string, value: string | null) => {
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
