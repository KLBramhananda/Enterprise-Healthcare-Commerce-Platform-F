/**
 * Locations Configuration
 *
 * Curated catalog of popular Indian cities for the Header Delivery Location
 * Selector. This is the single data source for the selector UI.
 *
 * Abstraction seam: the `Location` shape and `POPULAR_CITIES` list are kept
 * behind this module so the UI never depends on a concrete data source. When
 * ERPNext master data or a location service (e.g. a pincode/geocoding API)
 * becomes available, this module can be swapped to read from that source while
 * exposing the same `Location` type — no UI changes required.
 */

/** A selectable delivery location. */
export interface Location {
  /** Stable identifier (e.g. city code / pincode in the future). */
  id: string;
  /** Display name of the city. */
  name: string;
  /** Optional state / region shown as a secondary label. */
  state: string;
}

/** Curated popular Indian cities shown in the header selector. */
export const POPULAR_CITIES: Location[] = [
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka" },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra" },
  { id: "delhi", name: "Delhi", state: "Delhi NCR" },
  { id: "pune", name: "Pune", state: "Maharashtra" },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana" },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu" },
  { id: "kolkata", name: "Kolkata", state: "West Bengal" },
  { id: "gurugram", name: "Gurugram", state: "Haryana" },
  { id: "noida", name: "Noida", state: "Uttar Pradesh" },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat" },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan" },
  { id: "kochi", name: "Kochi", state: "Kerala" },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh" },
  { id: "chandigarh", name: "Chandigarh", state: "Chandigarh" },
  { id: "indore", name: "Indore", state: "Madhya Pradesh" },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh" },
  { id: "patna", name: "Patna", state: "Bihar" },
  { id: "guwahati", name: "Guwahati", state: "Assam" },
  { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh" },
  { id: "bhubaneswar", name: "Bhubaneswar", state: "Odisha" },
  { id: "srinagar", name: "Srinagar", state: "Jammu & Kashmir" },
  { id: "farther-afield", name: "Other", state: "—" },
];

/**
 * Filter the curated cities by a search query (case-insensitive substring
 * match against name and state).
 *
 * This is a lightweight, synchronous filter for the header selector. If a
 * backend location service later supplies search-as-you-type results, the
 * selector UI keeps working because it only calls this function.
 */
export function searchLocations(query: string): Location[] {
  const q = query.trim().toLowerCase();
  if (!q) return POPULAR_CITIES;
  return POPULAR_CITIES.filter(
    (loc) => loc.name.toLowerCase().includes(q) || loc.state.toLowerCase().includes(q),
  );
}

/** Look up a location by its id, or null if unknown. */
export function findLocationById(id: string | null | undefined): Location | null {
  if (!id) return null;
  return POPULAR_CITIES.find((loc) => loc.id === id) ?? null;
}
