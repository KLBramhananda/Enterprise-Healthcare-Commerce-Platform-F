/**
 * Engagement Service Interface
 *
 * Defines the contract for all customer engagement operations.
 * The UI layer depends ONLY on this interface — never on a concrete implementation.
 * To integrate with ERPNext, implement IEngagementService and swap the export in services/index.ts.
 */

import type {
  Offer,
  OfferStatus,
  Coupon,
  CouponStatus,
  LoyaltyAccount,
  LoyaltyTransaction,
  LoyaltyTier,
  ReferralInfo,
  Referral,
  MembershipStatus,
  MembershipTierName,
} from "@/types/engagement";

export interface IEngagementService {
  /* ── Offers ── */

  /** Fetch offers filtered by status. */
  getOffers(status?: OfferStatus): Promise<Offer[]>;

  /** Single offer by ID. */
  getOffer(id: string): Promise<Offer>;

  /** Save/unsave an offer for the current user. */
  toggleSaveOffer(id: string): Promise<boolean>;

  /* ── Coupons ── */

  /** Fetch coupons filtered by status. */
  getCoupons(status?: CouponStatus): Promise<Coupon[]>;

  /** Single coupon by ID. */
  getCoupon(id: string): Promise<Coupon>;

  /** Validate a coupon code and return the coupon if valid. */
  validateCoupon(code: string): Promise<Coupon>;

  /** Save/unsave a coupon for the current user. */
  toggleSaveCoupon(id: string): Promise<boolean>;

  /* ── Loyalty ── */

  /** Fetch the user's loyalty account summary. */
  getLoyaltyAccount(): Promise<LoyaltyAccount>;

  /** Fetch loyalty transaction history, newest first. */
  getLoyaltyHistory(): Promise<LoyaltyTransaction[]>;

  /** Fetch all loyalty tiers. */
  getLoyaltyTiers(): Promise<LoyaltyTier[]>;

  /** Redeem points for a reward (returns new balance). */
  redeemPoints(points: number): Promise<number>;

  /* ── Referrals ── */

  /** Fetch the user's referral info and history. */
  getReferralInfo(): Promise<ReferralInfo>;

  /** Send a referral invitation by email. */
  sendReferralInvite(email: string): Promise<Referral>;

  /** Fetch all referrals made by the user. */
  getReferrals(): Promise<Referral[]>;

  /* ── Membership ── */

  /** Fetch the user's current membership status and tier details. */
  getMembershipStatus(): Promise<MembershipStatus>;

  /** Fetch benefits across all tiers. */
  getMembershipBenefits(): Promise<{ tierName: MembershipTierName; discountPercent: number; loyaltyMultiplier: number; freeShipping: boolean; prioritySupport: boolean; exclusiveOffers: boolean; birthdayBonus: number }[]>;
}
