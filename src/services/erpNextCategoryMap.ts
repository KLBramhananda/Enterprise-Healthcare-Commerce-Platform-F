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
 * Phase 13A contract (catalog filter synchronization):
 *   Every navigable category resolves to exactly ONE ERPNext Item Group — the
 *   backend exposes one Item Group per category. A category that has no
 *   Item Group on the backend resolves to `undefined`, which the service
 *   layer MUST treat as an EMPTY result set, NEVER as "request the whole
 *   catalog". No unknown category may fall back to all products.
 *
 *   - medicines / allopathic → item_group=Allopathic
 *   - generic / otc           → item_group=Generic
 *   - ayurveda / ayurvedic    → item_group=Ayurvedic
 *   - homeopathy / homeopathic→ item_group=Homeopathy
 *   - wellness, personal-care, nutrition, health-devices, lab-tests
 *                            → no ERPNext Item Group exists → empty result
 *
 * Contract:
 *   - `itemGroupForCategory` returns the exact ERPNext Item Group to filter
 *     by, or `undefined` when the category has NO representation on the
 *     backend. Callers that receive `undefined` must return an empty result
 *     set; they must NEVER omit `item_group` to fetch the whole catalog.
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
 * `undefined` means "no ERPNext Item Group exists for this category" — the
 * catalog service must return an EMPTY result set for such categories, never
 * request the whole catalog.
 *
 * Note: `medicines` maps to the "Allopathic" Item Group — the backend exposes
 * one Item Group per category, so "medicines" only ever shows Allopathic
 * products. Generic/OTC products live under their own "Generic" category.
 */
const SLUG_TO_ITEM_GROUP: Readonly<Record<string, string | undefined>> = {
  // Categories mapped to a real ERPNext Item Group.
  medicines: "Allopathic",
  allopathic: "Allopathic",
  generic: "Generic",
  otc: "Generic",
  ayurveda: "Ayurvedic",
  ayurvedic: "Ayurvedic",
  homeopathy: "Homeopathy",
  homeopathic: "Homeopathy",

  // No ERPNext Item Group exists on the backend for these categories. The
  // service layer MUST return an empty result set for them — never fall back
  // to requesting the whole catalog.
  wellness: undefined,
  "personal-care": undefined,
  nutrition: undefined,
  "health-devices": undefined,
  "lab-tests": undefined,
};

/**
 * ERPNext Item Group → Frontend navigation slug (for display/breadcrumb).
 *
 * This reverse mapping is intentionally independent of the outbound
 * SLUG_TO_ITEM_GROUP table: a real ERPNext Item Group must map to the
 * navigation category that best represents it in the UI.
 *
 * These are the canonical, valid ERPNext Item Group names produced by the
 * KeeMeds Commerce backend. Keys are normalized (lower-case).
 */
const ITEM_GROUP_TO_NAV_SLUG: Readonly<Record<string, string>> = Object.freeze({
  allopathic: "medicines",
  otc: "medicines",
  generic: "medicines",
  ayurvedic: "ayurveda",
  homeopathy: "homeopathy",
});

/**
 * Resolve a category slug to the exact ERPNext Item Group that should be used
 * to filter the catalog, or `undefined` when the category has NO Item Group on
 * the backend.
 *
 * This is the primary resolver for outbound catalog requests. Callers MUST
 * treat `undefined` as an empty result set — they must NEVER omit the
 * `item_group` parameter and display products from other groups.
 */
export function itemGroupForCategory(categorySlug?: string): string | undefined {
  if (!categorySlug) return undefined;
  return SLUG_TO_ITEM_GROUP[categorySlug.trim().toLowerCase()];
}

/**
 * `itemGroupForCategory`'s shorthand alias.
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