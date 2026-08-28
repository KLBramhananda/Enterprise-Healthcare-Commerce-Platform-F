import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDebounce } from "@/hooks/common";
import { useHelpSearch } from "@/hooks/support";
import { useSupportStore } from "@/store/supportStore";
import { cn } from "@/utils/cn";

interface HelpSearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function HelpSearchBar({ className, placeholder = "Search for help...", autoFocus }: HelpSearchBarProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { data: results = [], isLoading } = useHelpSearch(debouncedQuery);
  const { recentSearches, addRecentSearch } = useSupportStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = () => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      setShowDropdown(false);
    }
  };

  const showRecent = showDropdown && !debouncedQuery && recentSearches.length > 0;
  const showResults = showDropdown && debouncedQuery.length >= 2;

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-0 px-4 py-3 shadow-sm transition-shadow focus-within:border-brand-400 focus-within:shadow-md focus-within:ring-4 focus-within:ring-brand-500/10">
        <Search size={18} className="shrink-0 text-surface-400" />
        <input
          type="text"
          value={query}
          aria-label={placeholder}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent text-sm text-surface-900 outline-none placeholder:text-surface-400"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); }} className="text-surface-400 hover:text-surface-600">
            <X size={16} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-dropdown mt-1 rounded-xl border border-surface-200 bg-surface-0 shadow-lg">
          {showRecent && (
            <div className="p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400">Recent searches</p>
              {recentSearches.map((s) => (
                <button key={s} type="button" onClick={() => { setQuery(s); addRecentSearch(s); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-surface-600 hover:bg-surface-50">
                  <Clock size={13} className="text-surface-300" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          )}
          {showResults && (
            <div className="p-3">
              {isLoading && <p className="py-4 text-center text-sm text-surface-400">Searching...</p>}
              {!isLoading && results.length === 0 && <p className="py-4 text-center text-sm text-surface-400">No results found</p>}
              {!isLoading && results.length > 0 && (
                <>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400">{results.length} result{results.length !== 1 ? "s" : ""}</p>
                  {results.map((r) => (
                    <Link key={`${r.type}-${r.id}`} to={r.url} onClick={() => { addRecentSearch(query.trim()); setShowDropdown(false); }} className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-surface-50">
                      <div className="mt-0.5 flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">{r.title}</p>
                        <p className="mt-0.5 text-xs text-surface-400 line-clamp-1">{r.description}</p>
                      </div>
                      <ArrowRight size={14} className="mt-1 shrink-0 text-surface-300" />
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
