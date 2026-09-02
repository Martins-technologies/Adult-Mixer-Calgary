import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../errors/AppError";
import { SubscriptionService } from "./subscription.service";
import { subscribeSchema } from "./subscription.validation";

export class SubscriptionController {
  static getPlans = asyncHandler(async (_req: Request, res: Response) => {
    const plans = SubscriptionService.getPlans();
    res.status(200).json(plans);
  });

  static getMySubscription = asyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const subscription = await SubscriptionService.getUserSubscription(
        req.user.userId,
      );

      res.status(200).json(subscription);
    },
  );

  static subscribe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const validated = subscribeSchema.parse(req.body);
    const result = await SubscriptionService.subscribe(
      req.user.userId,
      validated,
    );

    res.status(201).json(result);
  });

  static cancelSubscription = asyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const result = await SubscriptionService.cancelSubscription(
        req.user.userId,
      );

      res.status(200).json(result);
    },
  );
}
