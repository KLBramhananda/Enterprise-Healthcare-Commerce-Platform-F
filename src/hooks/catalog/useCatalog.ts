/**
 * Catalog hooks
 *
 * Read hooks over the catalog service layer.
 * React Query keys are structured so each query is cached and
 * deduplicated independently.
 */

import { useQuery } from "@tanstack/react-query";
import { services } from "@/services/factory";
import type { CatalogQuery } from "@/types/catalog";

const catalogService = services.catalog;

export function useCatalogCategories() {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: () => catalogService.getCategories(),
  });
}

export function useCatalogCategory(slug: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "category", slug],
    queryFn: () => catalogService.getCategory(slug!),
    enabled: slug != null,
    retry: false,
  });
}

export function useProducts(query: CatalogQuery) {
  return useQuery({
    queryKey: ["catalog", "products", query],
    queryFn: () => catalogService.getProducts(query),
    placeholderData: (previous) => previous,
  });
}

export function useCatalogBrands(categorySlug?: string) {
  return useQuery({
    queryKey: ["catalog", "brands", categorySlug ?? null],
    queryFn: () => catalogService.getBrandFacets(categorySlug),
  });
}

export function useProductDetails(id: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "product", id],
    queryFn: () => catalogService.getProductDetails(id!),
    enabled: id != null,
    retry: false,
  });
}

export function useRelatedProducts(id: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "related", id],
    queryFn: () => catalogService.getRelatedProducts(id!),
    enabled: id != null,
  });
}

export function useFrequentlyBoughtTogether(id: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "fbt", id],
    queryFn: () => catalogService.getFrequentlyBoughtTogether(id!),
    enabled: id != null,
  });
}
