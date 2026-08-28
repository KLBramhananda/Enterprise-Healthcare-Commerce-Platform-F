/**
 * Mock Engagement Service
 *
 * In-memory mock implementation of IEngagementService.
 * Pre-seeded with healthcare-themed offers, coupons, loyalty data,
 * referrals, and membership information.
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
import type { IEngagementService } from "./engagementService";

const now = new Date();
function daysAgo(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
function daysFromNow(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function hoursAgo(hours: number): string {
  const d = new Date(now);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ── Offers ── */

const MOCK_OFFERS: Offer[] = [
  {
    id: "offer-001",
    code: "WELLNESS15",
    title: "15% Off Wellness Essentials",
    description: "Save 15% on vitamins, supplements, and daily wellness products. Boost your health and save!",
    discountPercent: 15,
    minimumOrderAmount: 30,
    maximumDiscount: 20,
    terms: "Valid on wellness category only. Cannot be combined with other offers. One use per customer.",
    accent: "green",
    status: "active",
    target: "category",
    targetLabel: "Wellness",
    startDate: daysAgo(3),
    endDate: daysFromNow(14),
    redemptionCount: 342,
    saved: true,
  },
  {
    id: "offer-002",
    code: "MEDSAVE10",
    title: "$10 Off Prescription Medicines",
    description: "Flat $10 discount on your prescription medicine order. Upload your prescription and save.",
    discountAmount: 10,
    minimumOrderAmount: 50,
    terms: "Applicable on prescription medicines only. Valid once per user per month.",
    accent: "blue",
    status: "active",
    target: "category",
    targetLabel: "Medicines",
    startDate: daysAgo(1),
    endDate: daysFromNow(21),
    redemptionCount: 189,
  },
  {
    id: "offer-003",
    code: "DIABETES20",
    title: "20% Off Diabetes Care",
    description: "Special savings on glucometers, test strips, and diabetes management products.",
    discountPercent: 20,
    minimumOrderAmount: 25,
    maximumDiscount: 30,
    terms: "Valid on diabetes care products. Limit 2 uses per customer.",
    accent: "amber",
    status: "active",
    target: "category",
    targetLabel: "Diabetes Care",
    startDate: daysAgo(5),
    endDate: daysFromNow(10),
    redemptionCount: 567,
  },
  {
    id: "offer-004",
    code: "WINTER25",
    title: "25% Off Winter Health Bundle",
    description: "Get ready for winter with discounted immunity boosters, cold relief, and health devices.",
    discountPercent: 25,
    minimumOrderAmount: 40,
    maximumDiscount: 35,
    terms: "Starts Dec 1. Valid on select winter health products.",
    accent: "pink",
    status: "upcoming",
    target: "all",
    startDate: daysFromNow(7),
    endDate: daysFromNow(60),
    redemptionCount: 0,
  },
  {
    id: "offer-005",
    code: "NEWYEAR30",
    title: "30% Off New Year Wellness Kickoff",
    description: "Start the year right! 30% off all wellness and nutrition products.",
    discountPercent: 30,
    maximumDiscount: 50,
    terms: "Starts Jan 1. Valid on wellness and nutrition categories.",
    accent: "brand",
    status: "upcoming",
    target: "category",
    targetLabel: "Wellness & Nutrition",
    startDate: daysFromNow(14),
    endDate: daysFromNow(44),
    redemptionCount: 0,
  },
  {
    id: "offer-006",
    code: "SUMMER10",
    title: "10% Off Sun Care & Personal Care",
    description: "Stay protected this summer with savings on sunscreens, lotions, and personal care.",
    discountPercent: 10,
    terms: "This offer has expired.",
    accent: "amber",
    status: "expired",
    target: "category",
    targetLabel: "Personal Care",
    startDate: daysAgo(60),
    endDate: daysAgo(10),
    redemptionCount: 891,
  },
];

/* ── Coupons ── */

const MOCK_COUPONS: Coupon[] = [
  {
    id: "coupon-001",
    code: "SAVE20NOW",
    title: "20% Off Your Next Order",
    description: "Enjoy 20% off on any order above $25. Perfect for stocking up on essentials.",
    type: "percentage",
    value: 20,
    minimumOrderAmount: 25,
    maximumDiscount: 15,
    usageLimit: 1,
    usageCount: 0,
    expiresOn: daysFromNow(30),
    terms: "One-time use. Cannot be combined with other coupons.",
    status: "available",
    saved: false,
  },
  {
    id: "coupon-002",
    code: "FLAT8OFF",
    title: "$8 Off Orders Over $40",
    description: "Flat $8 discount when you spend $40 or more. No category restrictions.",
    type: "flat",
    value: 8,
    minimumOrderAmount: 40,
    usageLimit: 2,
    usageCount: 1,
    expiresOn: daysFromNow(15),
    terms: "Valid on all categories. Max 2 uses per customer.",
    status: "available",
    saved: true,
  },
  {
    id: "coupon-003",
    code: "RX50SAVE",
    title: "5% Off Prescription Orders",
    description: "Save on your prescription medicine orders with this exclusive coupon.",
    type: "percentage",
    value: 5,
    minimumOrderAmount: 20,
    usageLimit: 1,
    usageCount: 1,
    expiresOn: daysFromNow(7),
    terms: "Prescription orders only.",
    status: "applied",
    appliedToOrder: "ORD-1001",
  },
  {
    id: "coupon-004",
    code: "SPRING15",
    title: "15% Off Spring Wellness",
    description: "Spring into savings with 15% off wellness products.",
    type: "percentage",
    value: 15,
    minimumOrderAmount: 30,
    usageLimit: 1,
    usageCount: 1,
    expiresOn: daysAgo(5),
    terms: "Expired coupon.",
    status: "expired",
  },
  {
    id: "coupon-005",
    code: "BULK10",
    title: "10% Off Bulk Orders",
    description: "Planning a big order? Save 10% on orders above $75.",
    type: "percentage",
    value: 10,
    minimumOrderAmount: 75,
    maximumDiscount: 25,
    usageLimit: 1,
    usageCount: 0,
    expiresOn: daysFromNow(20),
    terms: "Orders $75+. One use per customer.",
    status: "saved",
    saved: true,
  },
];

/* ── Loyalty ── */

const loyaltyAccount: LoyaltyAccount = {
  userId: "usr-001",
  totalPoints: 2540,
  availablePoints: 2540,
  lifetimePoints: 4820,
  pendingPoints: 120,
  tierName: "Silver",
  tierLevel: 1,
  pointsExpiringOn: daysFromNow(90),
  pointsExpiringCount: 400,
};

const MOCK_LOYALTY_HISTORY: LoyaltyTransaction[] = [
  {
    id: "loy-tx-001",
    type: "earned",
    points: 500,
    source: "order",
    description: "Points earned from order ORD-1001",
    orderId: "ORD-1001",
    createdAt: hoursAgo(6),
  },
  {
    id: "loy-tx-002",
    type: "earned",
    points: 200,
    source: "order",
    description: "Points earned from order ORD-1000",
    orderId: "ORD-1000",
    createdAt: daysAgo(3),
  },
  {
    id: "loy-tx-003",
    type: "earned",
    points: 100,
    source: "referral",
    description: "Referral bonus for inviting Priya S.",
    createdAt: daysAgo(7),
  },
  {
    id: "loy-tx-004",
    type: "redeemed",
    points: -300,
    source: "order",
    description: "Redeemed 300 points on order ORD-0998",
    orderId: "ORD-0998",
    createdAt: daysAgo(10),
  },
  {
    id: "loy-tx-005",
    type: "earned",
    points: 50,
    source: "review",
    description: "Review bonus for rating Omega-3 Fish Oil",
    createdAt: daysAgo(12),
  },
  {
    id: "loy-tx-006",
    type: "earned",
    points: 100,
    source: "signup",
    description: "Welcome bonus for joining KeeMeds",
    createdAt: daysAgo(45),
  },
  {
    id: "loy-tx-007",
    type: "expired",
    points: -150,
    source: "bonus",
    description: "150 points expired after 12-month validity",
    createdAt: daysAgo(30),
  },
  {
    id: "loy-tx-008",
    type: "earned",
    points: 350,
    source: "order",
    description: "Points earned from order ORD-0995",
    orderId: "ORD-0995",
    createdAt: daysAgo(20),
  },
  {
    id: "loy-tx-009",
    type: "earned",
    points: 75,
    source: "bonus",
    description: "Birthday bonus points",
    createdAt: daysAgo(60),
  },
  {
    id: "loy-tx-010",
    type: "adjusted",
    points: 25,
    source: "membership",
    description: "Silver tier monthly bonus",
    createdAt: daysAgo(15),
  },
];

const MOCK_LOYALTY_TIERS: LoyaltyTier[] = [
  {
    level: 1,
    name: "Silver",
    minPoints: 0,
    maxPoints: 4999,
    benefits: [
      "Earn 1 point per $1 spent",
      "5% discount on all orders",
      "Free shipping on orders above $50",
    ],
    color: "#94a3b8",
  },
  {
    level: 2,
    name: "Gold",
    minPoints: 5000,
    maxPoints: 14999,
    benefits: [
      "Earn 1.5 points per $1 spent",
      "10% discount on all orders",
      "Free shipping on all orders",
      "Priority customer support",
      "Early access to sales",
    ],
    color: "#f59e0b",
  },
  {
    level: 3,
    name: "Platinum",
    minPoints: 15000,
    maxPoints: 29999,
    benefits: [
      "Earn 2 points per $1 spent",
      "15% discount on all orders",
      "Free express shipping",
      "Priority customer support",
      "Exclusive member-only offers",
      "Birthday bonus: 500 points",
    ],
    color: "#6366f1",
  },
  {
    level: 4,
    name: "Diamond",
    minPoints: 30000,
    maxPoints: Infinity,
    benefits: [
      "Earn 3 points per $1 spent",
      "20% discount on all orders",
      "Free same-day delivery",
      "Dedicated account manager",
      "Exclusive member-only offers",
      "Birthday bonus: 1000 points",
      "VIP event invitations",
    ],
    color: "#06b6d4",
  },
];

/* ── Referrals ── */

const MOCK_REFERRALS: Referral[] = [
  {
    id: "ref-001",
    referredEmail: "priya.sharma@email.com",
    referredName: "Priya Sharma",
    status: "completed",
    referralCode: "KEEMEDS2024",
    invitedAt: daysAgo(30),
    completedAt: daysAgo(22),
    rewardPoints: 100,
  },
  {
    id: "ref-002",
    referredEmail: "rahul.kumar@email.com",
    referredName: "Rahul Kumar",
    status: "pending",
    referralCode: "KEEMEDS2024",
    invitedAt: daysAgo(10),
  },
  {
    id: "ref-003",
    referredEmail: "anita.desai@email.com",
    status: "pending",
    referralCode: "KEEMEDS2024",
    invitedAt: daysAgo(3),
  },
];

const referralInfo: ReferralInfo = {
  referralCode: "KEEMEDS2024",
  referralLink: "https://keemeds.com/r/KEEMEDS2024",
  totalReferred: 3,
  completedReferrals: 1,
  pendingReferrals: 2,
  totalRewardPoints: 100,
  rewardPerReferral: 100,
  referrals: MOCK_REFERRALS,
};

/* ── Membership ── */

const ALL_MEMBERSHIP_TIERS: MembershipStatus["allTiers"] = [
  {
    name: "Silver",
    minSpend: 0,
    maxSpend: 499,
    discountPercent: 5,
    loyaltyMultiplier: 1,
    freeShipping: false,
    prioritySupport: false,
    exclusiveOffers: false,
    birthdayBonus: 25,
    color: "#94a3b8",
  },
  {
    name: "Gold",
    minSpend: 500,
    maxSpend: 999,
    discountPercent: 10,
    loyaltyMultiplier: 1.5,
    freeShipping: true,
    prioritySupport: true,
    exclusiveOffers: false,
    birthdayBonus: 50,
    color: "#f59e0b",
  },
  {
    name: "Platinum",
    minSpend: 1000,
    maxSpend: 2499,
    discountPercent: 15,
    loyaltyMultiplier: 2,
    freeShipping: true,
    prioritySupport: true,
    exclusiveOffers: true,
    birthdayBonus: 100,
    color: "#6366f1",
  },
  {
    name: "Diamond",
    minSpend: 2500,
    maxSpend: null,
    discountPercent: 20,
    loyaltyMultiplier: 3,
    freeShipping: true,
    prioritySupport: true,
    exclusiveOffers: true,
    birthdayBonus: 200,
    color: "#06b6d4",
  },
];

const membershipStatus: MembershipStatus = {
  currentTier: "Silver",
  currentSpend: 450,
  nextTier: "Gold",
  spendToNextTier: 50,
  memberSince: daysAgo(120),
  tierBenefits: ALL_MEMBERSHIP_TIERS[0],
  allTiers: ALL_MEMBERSHIP_TIERS,
};

const membershipBenefits = ALL_MEMBERSHIP_TIERS.map((t) => ({
  tierName: t.name as MembershipTierName,
  discountPercent: t.discountPercent,
  loyaltyMultiplier: t.loyaltyMultiplier,
  freeShipping: t.freeShipping,
  prioritySupport: t.prioritySupport,
  exclusiveOffers: t.exclusiveOffers,
  birthdayBonus: t.birthdayBonus,
}));

/* ── Service ── */

export class MockEngagementService implements IEngagementService {
  /* ── Offers ── */

  async getOffers(status?: OfferStatus): Promise<Offer[]> {
    await delay();
    let result = [...MOCK_OFFERS];
    if (status) {
      result = result.filter((o) => o.status === status);
    }
    return result.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
  }

  async getOffer(id: string): Promise<Offer> {
    await delay();
    const offer = MOCK_OFFERS.find((o) => o.id === id);
    if (!offer) throw new Error("Offer not found.");
    return { ...offer };
  }

  async toggleSaveOffer(id: string): Promise<boolean> {
    await delay(100);
    const offer = MOCK_OFFERS.find((o) => o.id === id);
    if (!offer) throw new Error("Offer not found.");
    offer.saved = !offer.saved;
    return offer.saved;
  }

  /* ── Coupons ── */

  async getCoupons(status?: CouponStatus): Promise<Coupon[]> {
    await delay();
    let result = [...MOCK_COUPONS];
    if (status) {
      result = result.filter((c) => c.status === status);
    }
    return result;
  }

  async getCoupon(id: string): Promise<Coupon> {
    await delay();
    const coupon = MOCK_COUPONS.find((c) => c.id === id);
    if (!coupon) throw new Error("Coupon not found.");
    return { ...coupon };
  }

  async validateCoupon(code: string): Promise<Coupon> {
    await delay(150);
    const coupon = MOCK_COUPONS.find(
      (c) => c.code.toLowerCase() === code.toLowerCase() && c.status !== "expired",
    );
    if (!coupon) throw new Error("Invalid or expired coupon code.");
    return { ...coupon };
  }

  async toggleSaveCoupon(id: string): Promise<boolean> {
    await delay(100);
    const coupon = MOCK_COUPONS.find((c) => c.id === id);
    if (!coupon) throw new Error("Coupon not found.");
    coupon.saved = !coupon.saved;
    coupon.status = coupon.saved ? "saved" : "available";
    return coupon.saved;
  }

  /* ── Loyalty ── */

  async getLoyaltyAccount(): Promise<LoyaltyAccount> {
    await delay();
    return { ...loyaltyAccount };
  }

  async getLoyaltyHistory(): Promise<LoyaltyTransaction[]> {
    await delay();
    return [...MOCK_LOYALTY_HISTORY].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getLoyaltyTiers(): Promise<LoyaltyTier[]> {
    await delay();
    return MOCK_LOYALTY_TIERS.map((t) => ({ ...t, benefits: [...t.benefits] }));
  }

  async redeemPoints(points: number): Promise<number> {
    await delay(200);
    if (points <= 0) throw new Error("Points must be greater than zero.");
    if (points > loyaltyAccount.availablePoints) {
      throw new Error("Insufficient points balance.");
    }
    loyaltyAccount.availablePoints -= points;
    loyaltyAccount.totalPoints -= points;
    MOCK_LOYALTY_HISTORY.unshift({
      id: `loy-tx-${String(MOCK_LOYALTY_HISTORY.length + 1).padStart(3, "0")}`,
      type: "redeemed",
      points: -points,
      source: "order",
      description: `Redeemed ${points} points`,
      createdAt: new Date().toISOString(),
    });
    return loyaltyAccount.availablePoints;
  }

  /* ── Referrals ── */

  async getReferralInfo(): Promise<ReferralInfo> {
    await delay();
    return { ...referralInfo, referrals: MOCK_REFERRALS.map((r) => ({ ...r })) };
  }

  async sendReferralInvite(email: string): Promise<Referral> {
    await delay(250);
    const newReferral: Referral = {
      id: `ref-${String(MOCK_REFERRALS.length + 1).padStart(3, "0")}`,
      referredEmail: email,
      status: "pending",
      referralCode: "KEEMEDS2024",
      invitedAt: new Date().toISOString(),
    };
    MOCK_REFERRALS.push(newReferral);
    referralInfo.totalReferred += 1;
    referralInfo.pendingReferrals += 1;
    referralInfo.referrals = [...MOCK_REFERRALS];
    return { ...newReferral };
  }

  async getReferrals(): Promise<Referral[]> {
    await delay();
    return MOCK_REFERRALS.map((r) => ({ ...r }));
  }

  /* ── Membership ── */

  async getMembershipStatus(): Promise<MembershipStatus> {
    await delay();
    return {
      ...membershipStatus,
      tierBenefits: { ...membershipStatus.tierBenefits },
      allTiers: membershipStatus.allTiers.map((t) => ({ ...t })),
    };
  }

  async getMembershipBenefits(): Promise<{ tierName: MembershipTierName; discountPercent: number; loyaltyMultiplier: number; freeShipping: boolean; prioritySupport: boolean; exclusiveOffers: boolean; birthdayBonus: number }[]> {
    await delay();
    return membershipBenefits.map((b) => ({ ...b }));
  }
}
