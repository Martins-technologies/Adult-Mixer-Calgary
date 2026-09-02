import { BillingCycle, SubscriptionPlan } from "@prisma/client";

export type {
  PlanConfig,
  PlanFeatureFlags,
  SubscriptionTier,
} from "../payments/plans.config";

export {
  PLANS,
  FREE_FEATURE_FLAGS,
  TIER_ORDER,
  getPlanById,
  getPlanPrice,
  getFeatureFlags,
  meetsTierRequirement,
  getSubscriptionEndDate,
} from "../payments/plans.config";

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

import { PLANS } from "../payments/plans.config";

export const SUBSCRIPTION_PLANS = PLANS;

export const getPlanPriceLegacy = (
  plan: SubscriptionPlan,
  billingCycle: BillingCycle,
): number => {
  const planDetails = PLANS.find((item) => item.id === plan);
  if (!planDetails) {
    throw new Error(`Unknown plan: ${plan}`);
  }
  return billingCycle === "MONTHLY"
    ? planDetails.monthlyPrice
    : planDetails.yearlyPrice;
};
