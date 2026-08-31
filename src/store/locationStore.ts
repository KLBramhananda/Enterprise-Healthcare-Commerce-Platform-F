/**
 * Location Store
 *
 * Zustand store for the Header Delivery Location with localStorage persistence,
 * mirroring the Language Store pattern.
 *
 * The selected city persists locally so the Header Delivery Location display
 * survives a page refresh. Defaults to "Bengaluru".
 *
 * Stored value is a `Location.id`. The full Location object is resolved via
 * `findLocationById` in the consuming component so the UI stays decoupled from
 * the underlying data source (curated list today, ERPNext master data later).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { findLocationById } from "@/config/locations";

/** Fallback id when no location has been chosen yet. */
const DEFAULT_LOCATION_ID = "bengaluru";

interface LocationState {
  /** Id of the currently selected delivery location. */
  locationId: string;
  /** Select a location by id. */
  setLocationId: (locationId: string) => void;
  /** Clear the selected location back to the default. */
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      locationId: DEFAULT_LOCATION_ID,
      setLocationId: (locationId) => set({ locationId }),
      clearLocation: () => set({ locationId: DEFAULT_LOCATION_ID }),
    }),
    {
      name: "keemeds-location",
      partialize: (state) => ({ locationId: state.locationId }),
      // Sanitize a persisted value that may have become stale (e.g. a city
      // removed from the catalog) back to the default.
      merge: (persisted, current) => {
        const p = persisted as { locationId?: string } | undefined;
        const locationId =
          p?.locationId && findLocationById(p.locationId) ? p.locationId : current.locationId;
        return { ...current, locationId };
      },
    },
  ),
);
