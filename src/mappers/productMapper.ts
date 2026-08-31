/**
 * Product Mapper
 *
 * Maps between ERPNext Item DocType and frontend Product model.
 *
 * ERPNext shape (expected):
 *   { item_code, item_name, item_group, description, standard_rate, ... }
 *
 * Frontend shape:
 *   { id, name, brandName, manufacturer, categorySlug, form, packSize, ... }
 */

import type { Product, StockStatus } from "@/types/catalog";
import type { Mapper } from "./types";

/** ERPNext Item DocType shape. */
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

function resolveStockStatus(dto: ErpNextProductDto): StockStatus {
  if (dto.disabled) return "out_of_stock";
  return "in_stock";
}

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
      categorySlug: dto.item_group,
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
