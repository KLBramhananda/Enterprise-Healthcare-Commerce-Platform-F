/**
 * LocationSelector
 *
 * Searchable delivery-location picker for the global header (desktop dropdown).
 *
 * Wired exactly like the LanguageSelector / ProfileMenu / NotificationMenu so
 * it shares the identical shared-`Popover` pattern:
 *   - Open state is owned by the parent (CommerceHeader) via `isOpen`.
 *   - The Popover only ever reports *close* (`onOpenChange` -> `onClose`).
 *   - The anchor button lives in the header and is passed in via `anchorRef`.
 *   - The Popover provides portal positioning, outside-click, Escape, focus
 *     management with return-focus, and Arrow/Home/End keyboard navigation
 *     for the `listbox` role.
 *
 * The difference from the static Language list is a real-time search input at
 * the top of the panel. Typing filters the curated city catalog; selecting a
 * city persists it (localStorage) and immediately updates the header display.
 *
 * City data lives behind `src/config/locations` (see the abstraction seam there
 * for swapping in ERPNext master data / a location service without UI changes).
 */

import { useMemo, useRef, useState, type RefObject } from "react";
import { Check, MapPin, Search, X } from "lucide-react";
import { POPULAR_CITIES, searchLocations, type Location } from "@/config/locations";
import { useLocationStore } from "@/store/locationStore";
import { Popover } from "@/components/ui";
import { cn } from "@/utils/cn";

/**
 * Reusable searchable location panel. Shared between the desktop dropdown and
 * any future surface (e.g. mobile drawer) that needs the same picker UI.
 */
export function LocationList({ onSelect }: { onSelect?: () => void }) {
  const locationId = useLocationStore((s) => s.locationId);
  const setLocationId = useLocationStore((s) => s.setLocationId);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchLocations(query), [query]);

  const handleSelect = (loc: Location) => {
    setLocationId(loc.id);
    setQuery("");
    onSelect?.();
  };

  return (
    <>
      {/* Search input */}
      <div className="relative px-3 pt-3">
        <Search
          size={14}
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-surface-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for your city"
          aria-label="Search cities"
          role="combobox"
          aria-expanded
          aria-haspopup="listbox"
          aria-autocomplete="list"
          className="w-full rounded-lg border border-surface-300 bg-surface-50 py-2 pl-8 pr-8 text-sm outline-none transition-all duration-fast ease-smooth placeholder:text-surface-400 hover:bg-surface-0 focus:border-brand-500 focus:bg-surface-0 focus:ring-4 focus:ring-brand-500/10"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 rounded p-0.5 text-surface-300 hover:text-surface-600"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Results */}
      <div role="listbox" aria-label="Choose delivery location" className="max-h-64 overflow-y-auto py-1">
        {results.map((loc) => (
          <button
            key={loc.id}
            type="button"
            role="option"
            aria-selected={locationId === loc.id}
            onClick={() => handleSelect(loc)}
            className={cn(
              "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors duration-fast hover:bg-brand-50",
              locationId === loc.id ? "bg-brand-50/60" : undefined,
            )}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <MapPin
                size={14}
                className={cn(
                  "shrink-0",
                  locationId === loc.id ? "text-brand-600" : "text-surface-300",
                )}
                aria-hidden="true"
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-surface-900">{loc.name}</span>
                {loc.state !== "—" && (
                  <span className="truncate text-xs text-surface-400">{loc.state}</span>
                )}
              </span>
            </span>
            {locationId === loc.id && (
              <Check size={16} className="shrink-0 text-brand-600" aria-hidden="true" />
            )}
          </button>
        ))}

        {results.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-surface-700">No cities found</p>
            <p className="mt-1 text-xs text-surface-400">
              Try a different city name
            </p>
            {POPULAR_CITIES.length === 0 && (
              <p className="mt-2 text-xs text-surface-400">
                Location data is not yet configured.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  /** Anchor element (the header location button) for the desktop popover. */
  anchorRef?: RefObject<HTMLButtonElement | null>;
}

export default function LocationSelector({
  isOpen,
  onClose,
  anchorRef,
}: LocationSelectorProps) {
  return (
    <Popover
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      anchorRef={anchorRef}
      placement="bottom-end"
      role="listbox"
      ariaLabel="Choose delivery location"
      className="hidden w-72 py-1 md:block"
    >
      <LocationList onSelect={onClose} />
    </Popover>
  );
}
