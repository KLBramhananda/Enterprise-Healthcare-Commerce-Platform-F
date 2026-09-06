/**
 * ERPNext Category Mapping
 *
 * Centralized mapping layer between frontend category slugs (used by the UI
 * navigation) and valid ERPNext Item Groups.
 *
 * Why this exists:
 *   The catalog UI drives category filtering with frontend-only slugs (e.g.
 *   "medicines", "ayurveda"). Sending those slugs straight to ERPNext as the
 *   `item_group` query parameter would filter against non-existent Item
 *   Groups and return no products.
 *
 * Phase 11.2 alignment (navigation categories vs ERPNext Item Groups):
 *   - medicines      → NO item_group filter (display the entire medicine catalog)
 *   - ayurveda       → item_group=Ayurvedic
 *   - homeopathy     → item_group=Homeopathy (only when data exists)
 *   - wellness       → NO filter (temporary fallback)
 *   - personal-care  → NO filter (temporary fallback)
 *   - nutrition      → NO filter (temporary fallback)
 *   - health-devices → NO filter (temporary fallback)
 *   - lab-tests      → placeholder behavior (no filter)
 *
 * Contract:
 *   - `itemGroupForCategory` returns the exact ERPNext Item Group to filter
 *     by, or `undefined` when NO `item_group` filter should be sent (the
 *     whole catalog for that section is returned, e.g. medicines).
 *   - `toErpNextItemGroup` is the shorthand used when only the Item Group
 *     string (if any) is needed.
 *   - `toErpNextCategorySlug` translates ERPNext Item Group names back to
 *     the frontend navigation slug for display and breadcrumbs.
 *   - Only valid, existing ERPNext Item Groups are ever produced here — never
 *     a raw frontend slug.
 *
 * Single source of truth: every catalog request that filters by category
 * (search, filters, pagination, and future APIs) must resolve the category
 * through these functions rather than forwarding the raw slug.
 */

/**
 * Frontend category slug → ERPNext Item Group (and canonical Item Group
 * name aliases). Keys are normalized (trimmed, lower-case). Values are the
 * exact Item Group names used by the KeeMeds Commerce backend. A value of
 * `null` means "do not filter" for that category.
 *
 * Note: `medicines` deliberately maps to `null` so the complete imported
 * medicine catalog (across all Item Groups) is shown, not only "Allopathic".
 */
const SLUG_TO_ITEM_GROUP: Readonly<Record<string, string | null>> = {
  // Categories that show the full medicine/OTC catalog with no Item Group filter.
  medicines: null,
  otc: null,
  generic: null,

  // Categories mapped to a real ERPNext Item Group.
  ayurveda: "Ayurvedic",
  homeopathy: "Homeopathy",

  // Temporary fallbacks — no ERPNext filter until dedicated data exists.
  wellness: null,
  "personal-care": null,
  nutrition: null,
  "health-devices": null,
  "lab-tests": null,

  // Canonical Item Group name aliases (any casing) → canonical form
  allopathic: "Allopathic",
  ayurvedic: "Ayurvedic",
  homeopathic: "Homeopathy",
};

/**
 * ERPNext Item Group → Frontend navigation slug (for display/breadcrumb).
 *
 * This reverse mapping is intentionally independent of the outbound
 * SLUG_TO_ITEM_GROUP table: a real ERPNext Item Group must map to the
 * navigation category that best represents it in the UI, even for categories
 * that are "no filter" outbound (e.g. medicines).
 *
 * These are the canonical, valid ERPNext Item Group names produced by the
 * KeeMeds Commerce backend. Keys are normalized (lower-case).
 */
const ITEM_GROUP_TO_NAV_SLUG: Readonly<Record<string, string>> = Object.freeze({
  allopathic: "medicines",
  ayurvedic: "ayurveda",
  homeopathy: "homeopathy",
  otc: "medicines",
  generic: "medicines",
});

/**
 * Resolve a category slug to the ERPNext Item Group that should be used to
 * filter the catalog, or `undefined` when NO `item_group` filter should be
 * sent (the whole catalog for the section is returned).
 *
 * This is the primary resolver for outbound catalog requests: callers omit
 * the `item_group` parameter when the result is `undefined`, guaranteeing an
 * invalid Item Group is never sent to ERPNext.
 */
export function itemGroupForCategory(categorySlug?: string): string | undefined {
  if (!categorySlug) return undefined;
  const group = SLUG_TO_ITEM_GROUP[categorySlug.trim().toLowerCase()];
  return group ?? undefined;
}

/**
 * Resolve a category slug to a valid ERPNext Item Group, or `undefined` when
 * no valid Item Group exists or no filter should be applied.
 */
export function toErpNextItemGroup(categorySlug?: string): string | undefined {
  return itemGroupForCategory(categorySlug);
}

/**
 * Resolve an ERPNext Item Group name to the corresponding frontend navigation
 * slug for display/breadcrumb purposes. Returns `undefined` when the Item
 * Group has no known navigation equivalent, so callers fall back to a raw
 * value.
 */
export function toErpNextCategorySlug(itemGroup?: string): string | undefined {
  if (!itemGroup) return undefined;
  return ITEM_GROUP_TO_NAV_SLUG[itemGroup.trim().toLowerCase()];
}
