import { BillingCycle, SubscriptionPlan } from "@prisma/client";
import { env } from "../../../config/env";

export type SubscriptionTier = SubscriptionPlan | "FREE";

export interface PlanFeatureFlags {
  browseProfiles: boolean;
  likesPerDay: number | null;
  messaging: boolean;
  videoChat: boolean;
  seeWhoLikedYou: boolean;
  advancedMatching: boolean;
  advancedFilters: boolean;
  profileBoost: boolean;
  readReceipts: boolean;
  incognitoMode: boolean;
  priorityPlacement: boolean;
}

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  featureFlags: PlanFeatureFlags;
}

export const TIER_ORDER: Record<SubscriptionTier, number> = {
  FREE: 0,
  STARTER: 1,
  PREMIUM: 2,
  ELITE: 3,
};

export const PLANS: PlanConfig[] = [
  {
    id: "STARTER",
    name: "Starter",
    tagline: "Perfect for beginners",
    monthlyPrice: 2.99,
    yearlyPrice: 29.99,
    features: [
      "Browse unlimited profiles",
      "5 likes per day",
      "Basic matching algorithm",
    ],
    featureFlags: {
      browseProfiles: true,
      likesPerDay: 5,
      messaging: false,
      videoChat: false,
      seeWhoLikedYou: false,
      advancedMatching: false,
      advancedFilters: false,
      profileBoost: false,
      readReceipts: false,
      incognitoMode: false,
      priorityPlacement: false,
    },
  },
  {
    id: "PREMIUM",
    name: "Premium",
    tagline: "Most popular choice",
    monthlyPrice: 5.99,
    yearlyPrice: 59.99,
    features: [
      "Everything in Starter",
      "Unlimited likes",
      "Send unlimited messages",
      "Video chat access",
      "See who liked you",
      "Advanced matching AI",
    ],
    featureFlags: {
      browseProfiles: true,
      likesPerDay: null,
      messaging: true,
      videoChat: true,
      seeWhoLikedYou: true,
      advancedMatching: true,
      advancedFilters: false,
      profileBoost: false,
      readReceipts: false,
      incognitoMode: false,
      priorityPlacement: false,
    },
  },
  {
    id: "ELITE",
    name: "Elite",
    tagline: "Ultimate experience",
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: [
      "Everything in Premium",
      "Priority profile placement",
      "Advanced filters & search",
      "Read receipts",
      "Incognito mode",
      "Profile boost (unlimited)",
      "24/7 VIP support",
      "Exclusive events access",
    ],
    featureFlags: {
      browseProfiles: true,
      likesPerDay: null,
      messaging: true,
      videoChat: true,
      seeWhoLikedYou: true,
      advancedMatching: true,
      advancedFilters: true,
      profileBoost: true,
      readReceipts: true,
      incognitoMode: true,
      priorityPlacement: true,
    },
  },
];

export const FREE_FEATURE_FLAGS: PlanFeatureFlags = {
  browseProfiles: true,
  likesPerDay: 5,
  messaging: false,
  videoChat: false,
  seeWhoLikedYou: false,
  advancedMatching: false,
  advancedFilters: false,
  profileBoost: false,
  readReceipts: false,
  incognitoMode: false,
  priorityPlacement: false,
};

export function getPlanById(plan: SubscriptionPlan): PlanConfig {
  const found = PLANS.find((item) => item.id === plan);
  if (!found) {
    throw new Error(`Unknown plan: ${plan}`);
  }
  return found;
}

export function getPlanPrice(
  plan: SubscriptionPlan,
  billingCycle: BillingCycle,
): number {
  const planDetails = getPlanById(plan);
  return billingCycle === "MONTHLY"
    ? planDetails.monthlyPrice
    : planDetails.yearlyPrice;
}

export function getFeatureFlags(tier: SubscriptionTier): PlanFeatureFlags {
  if (tier === "FREE") {
    return FREE_FEATURE_FLAGS;
  }
  return getPlanById(tier).featureFlags;
}

export function meetsTierRequirement(
  userTier: SubscriptionTier,
  minTier: SubscriptionTier,
): boolean {
  return TIER_ORDER[userTier] >= TIER_ORDER[minTier];
}

export function getPriceId(
  plan: SubscriptionPlan,
  billingCycle: BillingCycle,
): string {
  const map: Record<SubscriptionPlan, Record<BillingCycle, string>> = {
    STARTER: {
      MONTHLY: env.STRIPE_PRICE_ID_STARTER_MONTHLY,
      YEARLY: env.STRIPE_PRICE_ID_STARTER_YEARLY,
    },
    PREMIUM: {
      MONTHLY: env.STRIPE_PRICE_ID_PREMIUM_MONTHLY,
      YEARLY: env.STRIPE_PRICE_ID_PREMIUM_YEARLY,
    },
    ELITE: {
      MONTHLY: env.STRIPE_PRICE_ID_ELITE_MONTHLY,
      YEARLY: env.STRIPE_PRICE_ID_ELITE_YEARLY,
    },
  };
  return map[plan][billingCycle];
}

/** @deprecated Use getPriceId(plan, billingCycle) */
export function getStripePriceId(plan: SubscriptionPlan): string {
  return getPriceId(plan, "YEARLY");
}

export function getSubscriptionEndDate(billingCycle: BillingCycle): Date {
  const endDate = new Date();
  if (billingCycle === "MONTHLY") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  return endDate;
}
