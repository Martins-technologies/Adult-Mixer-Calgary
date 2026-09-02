import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../errors/AppError";
import { checkoutSchema } from "./payments.validation";
import { PaymentSubscriptionService } from "./subscription.service";
import { StripePaymentService } from "./stripe.service";
import { prisma } from "../../../config/prisma";

export class PaymentsController {
  static createStripeCheckoutSession = asyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const validated = checkoutSchema.parse(req.body);
      const result = await StripePaymentService.createCheckoutSession(
        req.user.userId,
        validated.plan,
        validated.billingCycle,
      );

      res.status(200).json(result);
    },
  );

  static handleStripeWebhook = async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      res.status(400).json({ message: "Missing Stripe signature" });
      return;
    }

    const rawBody = req.body as Buffer;
    let event;

    try {
      event = StripePaymentService.constructWebhookEvent(rawBody, signature);
    } catch {
      res.status(400).json({ message: "Invalid Stripe webhook signature" });
      return;
    }

    res.status(200).json({ received: true });

    StripePaymentService.handleWebhookEvent(event).catch((error) => {
      console.error("Stripe webhook processing failed:", error);
    });
  };

  static confirmCheckoutSession = asyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const sessionId = req.body?.sessionId;
      if (!sessionId || typeof sessionId !== "string") {
        throw new AppError("sessionId is required", 400);
      }

      const subscription = await StripePaymentService.confirmCheckoutSession(
        req.user.userId,
        sessionId,
      );

      res.status(200).json(subscription);
    },
  );

  static getSubscription = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const subscription = await PaymentSubscriptionService.getUserSubscription(
      req.user.userId,
    );

    res.status(200).json(subscription);
  });

  static cancelSubscription = asyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const subscription = await prisma.subscription.findUnique({
        where: { userId: req.user.userId },
      });

      if (!subscription?.stripeSubscriptionId) {
        throw new AppError("No active Stripe subscription found", 404);
      }

      const result = await StripePaymentService.cancelSubscription(
        req.user.userId,
      );

      res.status(200).json(result);
    },
  );
}
