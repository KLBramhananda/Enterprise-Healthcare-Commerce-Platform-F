/**
 * SearchBar
 *
 * Reusable search input component.
 * All styles reference design tokens from tokens.css.
 */

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-400">
        <Search size={16} />
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-surface-300 bg-surface-0 py-1.5 pl-10 pr-4 text-sm text-surface-900 placeholder-surface-400 outline-none transition-all duration-fast ease-smooth hover:border-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}
