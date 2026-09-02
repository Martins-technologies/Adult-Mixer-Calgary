import { BillingCycle, SubscriptionPlan } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { AppError } from "../../errors/AppError";
import { PLANS } from "../payments/plans.config";
import { SubscribeInput } from "./subscription.validation";
import { PaymentSubscriptionService } from "../payments/subscription.service";

export class SubscriptionService {
  static getPlans() {
    return PLANS.map((plan) => ({
      ...plan,
      monthlyPriceFormatted: `$${plan.monthlyPrice.toFixed(2)}`,
      yearlyPriceFormatted: `$${plan.yearlyPrice.toFixed(2)}`,
      yearlyOriginalPrice: `$${(plan.monthlyPrice * 12).toFixed(2)}`,
    }));
  }

  static async getUserSubscription(userId: string) {
    return PaymentSubscriptionService.getUserSubscription(userId);
  }

  static async subscribe(_userId: string, _data: SubscribeInput) {
    throw new AppError(
      "Direct subscription is disabled. Please complete checkout via /payments endpoints.",
      400,
    );
  }

  static async cancelSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.status !== "ACTIVE") {
      throw new AppError("No active subscription found", 404);
    }

    if (subscription.paymentProvider) {
      throw new AppError(
        "Please cancel your subscription via POST /api/payments/cancel",
        400,
      );
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
