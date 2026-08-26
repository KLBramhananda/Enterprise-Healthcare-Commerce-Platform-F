import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";
import { MockSupportService } from "@/services/supportMock";

const supportService = new MockSupportService();

export function useHelpSearch(query: string) {
  return useQuery({
    queryKey: ["support", "search", query],
    queryFn: () => supportService.searchHelp(query),
    enabled: query.length >= 2,
  });
}

export function useHelpSearchState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const setQuery = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set("q", value);
        else next.delete("q");
        return next;
      });
    },
    [setSearchParams],
  );

  return { query: q, setQuery };
}
