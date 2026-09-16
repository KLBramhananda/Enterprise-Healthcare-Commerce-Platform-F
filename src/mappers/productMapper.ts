/**
 * Product Mapper
 *
 * Maps between ERPNext product DTOs (from the live KeeMeds Commerce API) and
 * the frontend Product / ProductDetails domain models.
 *
 * Source shapes (live API):
 *   - List item   → ErpProductListItem (list_products)
 *   - Product detail → ErpProductDetail (get_product)
 *
 * Frontend shapes:
 *   - Product       → { id, name, brandName, manufacturer, categorySlug, ... }
 *   - ProductDetails → Product + description, images, sku, strength, ...
 *
 * The live API supplies only a subset of the static product fields (no MRP,
 * rating, review count, badges, Rx flag in the list). Missing fields get safe
 * defaults so the shared UI components render without errors.
 */

import type { Product, ProductDetails, ProductImage, StockStatus } from "@/types/catalog";
import type { Mapper } from "./types";
import type { ErpProductDetail, ErpProductImages, ErpProductListItem } from "@/types/erpnextProduct";
import { toErpNextCategorySlug } from "@/services/erpNextCategoryMap";

/** Legacy ERPNext Item DocType shape (kept for backward compatibility). */
export interface ErpNextProductDto {
  item_code: string;
  item_name: string;
  item_group: string;
  item_group_name?: string;
  brand?: string;
  manufacturer?: string;
  description: string;
  standard_rate: number;
  market_price?: number;
  image?: string;
  stock_uom: string;
  has_serial_no: number;
  has_batch_no: number;
  disabled: number;
  rating?: number;
  review_count?: number;
  slug?: string;
  is_prescription_required?: number;
  is_new?: number;
  is_bestseller?: number;
  is_trending?: number;
  is_limited_offer?: number;
  form?: string;
  pack_size?: string;
}

/* ── Stock status resolution ── */

function resolveStockStatus(dto: ErpNextProductDto): StockStatus {
  if (dto.disabled) return "out_of_stock";
  return "in_stock";
}

/* ── Numeric / boolean coercion helpers ── */

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toBool(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

/* ── Shared helpers ── */

/** Build the frontend image list from the API images object. */
function toImages(itemCode: string, itemName: string, images?: ErpProductImages | null): ProductImage[] {
  const gallery = Array.isArray(images?.gallery) ? images.gallery.filter((u): u is string => typeof u === "string") : [];
  const primary = String(images?.primary_image || gallery[0] || "");

  const result: ProductImage[] = [];
  if (primary) {
    result.push({ id: `${itemCode}-img-0`, url: primary, alt: `${itemName} product image`, isPrimary: true });
  }
  for (let i = 0; i < gallery.length; i++) {
    if (gallery[i] !== primary) {
      result.push({ id: `${itemCode}-img-${i + 1}`, url: gallery[i], alt: `${itemName} image ${i + 1}`, isPrimary: false });
    }
  }
  if (result.length === 0) {
    result.push({ id: `${itemCode}-img-0`, url: "", alt: `${itemName} product image`, isPrimary: true });
  }
  return result;
}

function primaryImage(images?: ErpProductImages | null): string | undefined {
  const primary = images?.primary_image;
  if (primary) return String(primary);
  const gallery = Array.isArray(images?.gallery) ? images.gallery.filter((u): u is string => typeof u === "string") : [];
  return gallery[0] || undefined;
}

/* ── Mapper: legacy Item DocType → Product ── */

export const productMapper: Mapper<ErpNextProductDto, Product> = {
  toDomain(dto) {
    const price = dto.standard_rate;
    const mrp = dto.market_price ?? price;
    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    return {
      id: dto.item_code,
      slug: dto.slug ?? dto.item_code,
      name: dto.item_name,
      brandName: dto.brand ?? "KeeMeds",
      manufacturer: dto.manufacturer ?? dto.brand ?? "KeeMeds",
      categorySlug: toErpNextCategorySlug(dto.item_group) ?? dto.item_group,
      form: dto.form ?? "Tablet",
      packSize: dto.pack_size ?? "1",
      price,
      mrp,
      discountPercent,
      rating: dto.rating ?? 0,
      reviewCount: dto.review_count ?? 0,
      requiresPrescription: !!dto.is_prescription_required,
      stockStatus: resolveStockStatus(dto),
      imageUrl: dto.image,
      isNew: !!dto.is_new,
      isBestseller: !!dto.is_bestseller,
      isTrending: !!dto.is_trending,
      isLimitedOffer: !!dto.is_limited_offer,
    };
  },

  toDto(domain) {
    return {
      item_code: domain.id,
      item_name: domain.name,
      item_group: domain.categorySlug,
      item_group_name: domain.categorySlug,
      brand: domain.brandName,
      manufacturer: domain.manufacturer,
      description: `${domain.name} - ${domain.packSize}`,
      standard_rate: domain.price,
      market_price: domain.mrp,
      image: domain.imageUrl,
      stock_uom: "Nos",
      has_serial_no: 0,
      has_batch_no: 0,
      disabled: domain.stockStatus === "out_of_stock" ? 1 : 0,
      rating: domain.rating,
      review_count: domain.reviewCount,
      slug: domain.slug,
      is_prescription_required: domain.requiresPrescription ? 1 : 0,
      is_new: domain.isNew ? 1 : 0,
      is_bestseller: domain.isBestseller ? 1 : 0,
      is_trending: domain.isTrending ? 1 : 0,
      is_limited_offer: domain.isLimitedOffer ? 1 : 0,
      form: domain.form,
      pack_size: domain.packSize,
    };
  },
};

/* ── Mapper: live API list item → Product ── */

export const productListItemMapper: Mapper<ErpProductListItem, Product> = {
  toDomain(dto) {
    const price = toNumber(dto.selling_price);
    const inStock = toBool(dto.in_stock);

    return {
      id: String(dto.item_code),
      slug: String(dto.item_code),
      name: String(dto.item_name || dto.item_code),
      brandName: String(dto.brand || "KeeMeds"),
      manufacturer: String(dto.manufacturer || dto.brand || "KeeMeds"),
      categorySlug: toErpNextCategorySlug(dto.item_group) ?? String(dto.item_group || "medicines"),
      form: String(dto.dosage_form || "Tablet"),
      packSize: "1",
      price,
      mrp: price,
      discountPercent: 0,
      rating: 0,
      reviewCount: 0,
      requiresPrescription: false,
      stockStatus: inStock ? "in_stock" : "out_of_stock",
      imageUrl: primaryImage(dto.images),
      isNew: false,
      isBestseller: false,
      isTrending: false,
      isLimitedOffer: false,
    };
  },

  toDto(domain) {
    return {
      item_code: domain.id,
      item_name: domain.name,
      brand: domain.brandName,
      manufacturer: domain.manufacturer,
      item_group: domain.categorySlug,
      dosage_form: domain.form,
      selling_price: domain.price,
      currency: "INR",
      in_stock: domain.stockStatus !== "out_of_stock",
      images: {
        primary_image: domain.imageUrl,
        gallery: domain.imageUrl ? [domain.imageUrl] : [],
      },
    };
  },
};

/* ── Mapper: live API detail → ProductDetails ── */

export const productDetailMapper: Mapper<ErpProductDetail, ProductDetails> = {
  toDomain(dto) {
    const base = productListItemMapper.toDomain(dto);
    const images = toImages(dto.item_code, base.name, dto.images);
    const inStock = toBool(dto.in_stock);

    return {
      ...base,
      description: String(dto.description || `${dto.item_name} by ${dto.brand || "KeeMeds"}.`),
      keyBenefits: [],
      uses: [],
      dosage: "",
      sideEffects: [],
      warnings: [],
      safetyInformation: "",
      precautions: [],
      storage: "",
      ingredients: String(dto.salt_composition || ""),
      composition: String(dto.salt_composition || ""),
      faqs: [],
      images,
      reviewSummary: { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      estimatedDeliveryDays: 2,
      returnable: false,
      expiryDate: undefined,
      sku: String(dto.item_code),
      strength: String(dto.strength || ""),
      availability: inStock ? "In stock and ready to ship" : "Currently unavailable",
      freeDelivery: false,
      reviews: [],
      questions: [],
    };
  },

  toDto(domain) {
    const listDto = productListItemMapper.toDto?.(domain) ?? {};
    return { ...listDto, description: domain.description } as ErpProductDetail;
  },
};

/** Fallback strength parser for products lacking a dedicated strength field. */
export function extractStrength(name: string): string {
  const match = name.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu|ml|%))/i);
  return match ? match[0].trim() : "";
}
