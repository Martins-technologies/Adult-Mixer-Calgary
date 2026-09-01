import { BillingCycle, SubscriptionPlan } from "@prisma/client";

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: PlanDetails[] = [
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
  },
];

export const getPlanPrice = (
  plan: SubscriptionPlan,
  billingCycle: BillingCycle,
): number => {
  const planDetails = SUBSCRIPTION_PLANS.find((item) => item.id === plan);

  if (!planDetails) {
    throw new Error(`Unknown plan: ${plan}`);
  }

  return billingCycle === "MONTHLY"
    ? planDetails.monthlyPrice
    : planDetails.yearlyPrice;
};

export const getSubscriptionEndDate = (billingCycle: BillingCycle): Date => {
  const endDate = new Date();

  if (billingCycle === "MONTHLY") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  return endDate;
};
