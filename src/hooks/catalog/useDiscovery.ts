/**
 * Discovery hooks
 *
 * Read hooks for brand browsing, collection browsing, health concern pages,
 * and recommendation sections. All queries are cached by React Query
 * and backed by the catalog service layer.
 */

import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MockCatalogService } from "@/services";
import type { DiscoveryQuery, CollectionSlug, DiscoverySortOption } from "@/types/catalog";
import { CATALOG_PAGE_SIZE } from "@/config/constants";

const catalogService = new MockCatalogService();
const RECENTLY_VIEWED_KEY = "keemeds-recently-viewed";
const MAX_RECENTLY_VIEWED = 20;

/* ── Brands ── */

export function useBrands() {
  return useQuery({
    queryKey: ["discovery", "brands"],
    queryFn: () => catalogService.getBrands(),
    staleTime: 300_000,
  });
}

export function useBrandBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["discovery", "brand", slug],
    queryFn: () => catalogService.getBrandBySlug(slug!),
    enabled: slug != null,
    retry: false,
  });
}

export function useBrandProducts(slug: string | undefined, query?: DiscoveryQuery) {
  return useQuery({
    queryKey: ["discovery", "brand-products", slug, query],
    queryFn: () => catalogService.getBrandProducts(slug!, query),
    enabled: slug != null,
    placeholderData: (prev) => prev,
  });
}

/* ── Collections ── */

export function useCollections() {
  return useQuery({
    queryKey: ["discovery", "collections"],
    queryFn: () => catalogService.getCollections(),
    staleTime: 300_000,
  });
}

export function useCollectionBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["discovery", "collection", slug],
    queryFn: () => catalogService.getCollectionBySlug(slug!),
    enabled: slug != null,
    retry: false,
  });
}

export function useCollectionProducts(slug: CollectionSlug | undefined, query?: DiscoveryQuery) {
  return useQuery({
    queryKey: ["discovery", "collection-products", slug, query],
    queryFn: () => catalogService.getCollectionProducts(slug!, query),
    enabled: slug != null,
    placeholderData: (prev) => prev,
  });
}

/* ── Health Concerns (detail page) ── */

export function useHealthConcernBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["discovery", "concern", slug],
    queryFn: () => catalogService.getHealthConcernBySlug(slug!),
    enabled: slug != null,
    retry: false,
  });
}

export function useHealthConcernProducts(slug: string | undefined, query?: DiscoveryQuery) {
  return useQuery({
    queryKey: ["discovery", "concern-products", slug, query],
    queryFn: () => catalogService.getHealthConcernProducts(slug!, query),
    enabled: slug != null,
    placeholderData: (prev) => prev,
  });
}

/* ── Recommendation Sections ── */

export function useBestSellers(limit = 12) {
  return useQuery({
    queryKey: ["discovery", "best-sellers", limit],
    queryFn: () => catalogService.getBestSellers(limit),
    staleTime: 300_000,
  });
}

export function useTrending(limit = 12) {
  return useQuery({
    queryKey: ["discovery", "trending", limit],
    queryFn: () => catalogService.getTrending(limit),
    staleTime: 300_000,
  });
}

export function useNewArrivals(limit = 12) {
  return useQuery({
    queryKey: ["discovery", "new-arrivals", limit],
    queryFn: () => catalogService.getNewArrivals(limit),
    staleTime: 300_000,
  });
}

export function useSimilarProducts(id: string | undefined, limit = 8) {
  return useQuery({
    queryKey: ["discovery", "similar", id, limit],
    queryFn: () => catalogService.getSimilarProducts(id!, limit),
    enabled: id != null,
  });
}

/* ── Recently Viewed ── */

function readRecentlyViewed(): string[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeRecentlyViewed(ids: string[]) {
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
  } catch {
    // silently ignore
  }
}

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>(readRecentlyViewed);

  const trackView = useCallback((productId: string) => {
    setIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_RECENTLY_VIEWED);
      writeRecentlyViewed(next);
      return next;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setIds([]);
    writeRecentlyViewed([]);
  }, []);

  return { ids, trackView, clearRecentlyViewed };
}

export function useRecentlyViewedProducts(ids: string[]) {
  return useQuery({
    queryKey: ["discovery", "recently-viewed", ids],
    queryFn: () => catalogService.getProductsByIds(ids),
    enabled: ids.length > 0,
  });
}

/* ── Discovery Page State (URL-synced sort + page) ── */

export function useDiscoveryState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const sortBy = (searchParams.get("sort") as DiscoverySortOption) ?? "popularity";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === null || value === "" || value === "popularity") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        if (key !== "page") next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  const query: DiscoveryQuery = { sortBy, page, pageSize: CATALOG_PAGE_SIZE };

  return { sortBy, page, query, setParam };
}
