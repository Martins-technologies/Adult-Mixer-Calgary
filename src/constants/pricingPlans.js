export const PLAN_IDS = {
  STARTER: "STARTER",
  PREMIUM: "PREMIUM",
  ELITE: "ELITE",
};

export const BILLING_CYCLES = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

export const PLAN_ROUTE_MAP = {
  Starter: "STARTER",
  Premium: "PREMIUM",
  Elite: "ELITE",
};

export const formatPlanPrice = (plan, billingCycle) => {
  const isMonthly = billingCycle === BILLING_CYCLES.MONTHLY;
  const price = isMonthly ? plan.monthlyPrice : plan.yearlyPrice;
  const originalPrice = isMonthly ? null : plan.monthlyPrice * 12;

  return {
    price: `$${price.toFixed(2)}`,
    originalPrice: originalPrice ? `$${originalPrice.toFixed(2)}` : "",
    period: isMonthly ? "per month" : "per year",
  };
};
