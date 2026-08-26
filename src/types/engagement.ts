/**
 * Engagement Types
 *
 * Domain types for the customer engagement module: offers, coupons,
 * loyalty, referrals, membership tiers, and personalized shopping.
 */

/* ── Offers ── */

export type OfferStatus = "active" | "upcoming" | "expired";
export type OfferAccent = "brand" | "blue" | "amber" | "pink" | "green";
export type OfferTarget = "all" | "category" | "product" | "brand";

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercent?: number;
  discountAmount?: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  terms: string;
  imageUrl?: string;
  accent: OfferAccent;
  status: OfferStatus;
  target: OfferTarget;
  targetLabel?: string;
  startDate: string;
  endDate: string;
  /** Number of times this offer has been redeemed (public count). */
  redemptionCount: number;
  /** Whether the current user has saved this offer. */
  saved?: boolean;
}

/* ── Coupons ── */

export type CouponStatus = "available" | "applied" | "expired" | "saved";
export type CouponType = "percentage" | "flat";

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  type: CouponType;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  expiresOn: string;
  terms: string;
  status: CouponStatus;
  saved?: boolean;
  appliedToOrder?: string;
}

/* ── Loyalty ── */

export type LoyaltyTransactionType = "earned" | "redeemed" | "expired" | "adjusted";
export type LoyaltySource = "order" | "referral" | "bonus" | "signup" | "review" | "birthday" | "membership";

export interface LoyaltyAccount {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  pendingPoints: number;
  tierName: string;
  tierLevel: number;
  pointsExpiringOn: string;
  pointsExpiringCount: number;
}

export interface LoyaltyTransaction {
  id: string;
  type: LoyaltyTransactionType;
  points: number;
  source: LoyaltySource;
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface LoyaltyTier {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  color: string;
}

/* ── Referrals ── */

export type ReferralStatus = "pending" | "completed" | "expired";

export interface Referral {
  id: string;
  referredEmail: string;
  referredName?: string;
  status: ReferralStatus;
  referralCode: string;
  invitedAt: string;
  completedAt?: string;
  rewardPoints?: number;
}

export interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  totalReferred: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalRewardPoints: number;
  rewardPerReferral: number;
  referrals: Referral[];
}

/* ── Membership ── */

export type MembershipTierName = "Silver" | "Gold" | "Platinum" | "Diamond";

export interface MembershipTierBenefits {
  name: string;
  description: string;
  tiers: MembershipTierName[];
}

export interface MembershipTier {
  name: MembershipTierName;
  minSpend: number;
  maxSpend: number | null;
  discountPercent: number;
  loyaltyMultiplier: number;
  freeShipping: boolean;
  prioritySupport: boolean;
  exclusiveOffers: boolean;
  birthdayBonus: number;
  color: string;
}

export interface MembershipStatus {
  currentTier: MembershipTierName;
  currentSpend: number;
  nextTier?: MembershipTierName;
  spendToNextTier?: number;
  memberSince: string;
  tierBenefits: MembershipTier;
  allTiers: MembershipTier[];
}

/* ── Personalized Shopping ── */

export interface PersonalizedRecommendation {
  id: string;
  reason: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  brand: string;
}
