import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import {
  getFeatureFlags,
  meetsTierRequirement,
  SubscriptionTier,
} from "../modules/payments/plans.config";
import { PaymentSubscriptionService } from "../modules/payments/subscription.service";

export function requireTier(minTier: SubscriptionTier) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const subscription = await PaymentSubscriptionService.getUserSubscription(
      req.user.userId,
    );

    if (
      subscription.tier === "FREE" ||
      (subscription.status !== "ACTIVE" && subscription.status !== "PAST_DUE")
    ) {
      throw new AppError(
        `This feature requires an active ${minTier} subscription or higher`,
        403,
      );
    }

    if (!meetsTierRequirement(subscription.tier, minTier)) {
      throw new AppError(
        `This feature requires ${minTier} subscription or higher`,
        403,
      );
    }

    next();
  };
}

export function requireFeature(
  feature: keyof ReturnType<typeof getFeatureFlags>,
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const hasAccess = await PaymentSubscriptionService.hasFeature(
      req.user.userId,
      feature,
    );

    if (!hasAccess) {
      throw new AppError(
        "Your subscription does not include this feature",
        403,
      );
    }

    next();
  };
}
