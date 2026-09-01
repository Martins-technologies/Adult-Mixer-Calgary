import { BillingCycle, SubscriptionPlan } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { AppError } from "../../errors/AppError";
import {
  SUBSCRIPTION_PLANS,
  getPlanPrice,
  getSubscriptionEndDate,
} from "./subscription.plans";
import { SubscribeInput } from "./subscription.validation";

export class SubscriptionService {
  static getPlans() {
    return SUBSCRIPTION_PLANS.map((plan) => ({
      ...plan,
      monthlyPriceFormatted: `$${plan.monthlyPrice.toFixed(2)}`,
      yearlyPriceFormatted: `$${plan.yearlyPrice.toFixed(2)}`,
      yearlyOriginalPrice: `$${(plan.monthlyPrice * 12).toFixed(2)}`,
    }));
  }

  static async getUserSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return null;
    }

    const planDetails = SUBSCRIPTION_PLANS.find(
      (plan) => plan.id === subscription.plan,
    );

    return {
      ...subscription,
      planDetails,
      price: getPlanPrice(subscription.plan, subscription.billingCycle),
    };
  }

  static async subscribe(userId: string, data: SubscribeInput) {
    const plan = data.plan as SubscriptionPlan;
    const billingCycle = data.billingCycle as BillingCycle;

    const planExists = SUBSCRIPTION_PLANS.some((item) => item.id === plan);

    if (!planExists) {
      throw new AppError("Invalid subscription plan", 400);
    }

    const endDate = getSubscriptionEndDate(billingCycle);

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        billingCycle,
        status: "ACTIVE",
        startDate: new Date(),
        endDate,
        cancelledAt: null,
      },
      update: {
        plan,
        billingCycle,
        status: "ACTIVE",
        startDate: new Date(),
        endDate,
        cancelledAt: null,
      },
    });

    const planDetails = SUBSCRIPTION_PLANS.find((item) => item.id === plan);

    return {
      subscription,
      planDetails,
      price: getPlanPrice(plan, billingCycle),
      message: `Successfully subscribed to the ${planDetails?.name} plan!`,
    };
  }

  static async cancelSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.status !== "ACTIVE") {
      throw new AppError("No active subscription found", 404);
    }

    const updated = await prisma.subscription.update({
      where: { userId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return {
      subscription: updated,
      message:
        "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
    };
  }
}
