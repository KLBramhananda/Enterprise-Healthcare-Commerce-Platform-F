/**
 * useHomepageContent
 *
 * Fetches all homepage storefront content through the homepage service layer.
 * React Query deduplicates concurrent calls from multiple sections into a
 * single request per cache lifetime.
 */

import { useQuery } from "@tanstack/react-query";
import { services } from "@/services/factory";

const homepageService = services.homepage;

export function useHomepageContent() {
  return useQuery({
    queryKey: ["homepage-content"],
    queryFn: () => homepageService.getHomepageContent(),
  });
}
