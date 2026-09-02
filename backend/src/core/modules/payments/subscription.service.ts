import {
  BillingCycle,
  PaymentProvider,
  PaymentTransactionStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  getFeatureFlags,
  getPlanById,
  getPlanPrice,
  meetsTierRequirement,
  SubscriptionTier,
} from "./plans.config";

export interface ApplySubscriptionInput {
  userId: string;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  endDate: Date | null;
  paymentProvider: PaymentProvider;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface LogTransactionInput {
  userId: string;
  provider: PaymentProvider;
  providerTransactionId: string;
  amount: number;
  currency?: string;
  plan: SubscriptionPlan;
  status: PaymentTransactionStatus;
  rawPayload?: unknown;
}

export class PaymentSubscriptionService {
  static async getEffectiveTier(userId: string): Promise<SubscriptionTier> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return "FREE";
    }

    if (!PaymentSubscriptionService.isSubscriptionActive(subscription)) {
      return "FREE";
    }

    return subscription.plan;
  }

  static isSubscriptionActive(subscription: {
    status: SubscriptionStatus;
    endDate: Date | null;
  }): boolean {
    if (subscription.status !== "ACTIVE" && subscription.status !== "PAST_DUE") {
      return false;
    }

    if (subscription.endDate && subscription.endDate <= new Date()) {
      return false;
    }

    return true;
  }

  static async getUserSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const tier = await PaymentSubscriptionService.getEffectiveTier(userId);
    const featureFlags = getFeatureFlags(tier);

    if (!subscription) {
      return {
        tier: "FREE" as const,
        status: null,
        plan: null,
        billingCycle: null,
        startDate: null,
        endDate: null,
        paymentProvider: null,
        cancelledAt: null,
        featureFlags,
        planDetails: null,
        price: null,
      };
    }

    const planDetails = subscription.plan
      ? getPlanById(subscription.plan)
      : null;

    return {
      tier,
      status: subscription.status,
      plan: subscription.plan,
      billingCycle: subscription.billingCycle,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      paymentProvider: subscription.paymentProvider,
      cancelledAt: subscription.cancelledAt,
      featureFlags,
      planDetails,
      price: getPlanPrice(subscription.plan, subscription.billingCycle),
    };
  }

  static async hasFeature(
    userId: string,
    feature: keyof ReturnType<typeof getFeatureFlags>,
  ): Promise<boolean> {
    const tier = await PaymentSubscriptionService.getEffectiveTier(userId);
    const flags = getFeatureFlags(tier);
    const value = flags[feature];
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value > 0;
    }
    return value !== null;
  }

  static async requireTier(
    userId: string,
    minTier: SubscriptionTier,
  ): Promise<SubscriptionTier> {
    const tier = await PaymentSubscriptionService.getEffectiveTier(userId);
    if (!meetsTierRequirement(tier, minTier)) {
      return tier;
    }
    return tier;
  }

  static async logTransaction(input: LogTransactionInput) {
    const existing = await prisma.paymentTransaction.findUnique({
      where: { providerTransactionId: input.providerTransactionId },
    });

    if (existing) {
      return prisma.paymentTransaction.update({
        where: { providerTransactionId: input.providerTransactionId },
        data: {
          status: input.status,
          rawPayload: input.rawPayload
            ? (input.rawPayload as object)
            : undefined,
        },
      });
    }

    return prisma.paymentTransaction.create({
      data: {
        userId: input.userId,
        provider: input.provider,
        providerTransactionId: input.providerTransactionId,
        amount: input.amount,
        currency: input.currency ?? "USD",
        plan: input.plan,
        status: input.status,
        rawPayload: input.rawPayload
          ? (input.rawPayload as object)
          : undefined,
      },
    });
  }

  static async isWebhookEventProcessed(stripeEventId: string): Promise<boolean> {
    const existing = await prisma.paymentTransaction.findUnique({
      where: { providerTransactionId: `evt_${stripeEventId}` },
    });
    return Boolean(existing);
  }

  static async logWebhookEvent(input: {
    userId: string;
    stripeEventId: string;
    eventType: string;
    status: string;
    rawPayload: unknown;
  }) {
    const providerTransactionId = `evt_${input.stripeEventId}`;
    const existing = await prisma.paymentTransaction.findUnique({
      where: { providerTransactionId },
    });

    if (existing) {
      return existing;
    }

    return prisma.paymentTransaction.create({
      data: {
        userId: input.userId,
        provider: "STRIPE",
        providerTransactionId,
        amount: 0,
        plan: "STARTER",
        status: input.status === "processed" ? "SUCCEEDED" : "FAILED",
        rawPayload: {
          stripeEventId: input.stripeEventId,
          eventType: input.eventType,
          status: input.status,
          payload: input.rawPayload,
        } as object,
      },
    });
  }

  static async isTransactionProcessed(
    providerTransactionId: string,
  ): Promise<boolean> {
    const existing = await prisma.paymentTransaction.findUnique({
      where: { providerTransactionId },
    });
    return existing?.status === "SUCCEEDED";
  }

  static async applySubscription(input: ApplySubscriptionInput) {
    return prisma.subscription.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        plan: input.plan,
        billingCycle: input.billingCycle,
        status: input.status,
        startDate: new Date(),
        endDate: input.endDate,
        cancelledAt: null,
        paymentProvider: input.paymentProvider,
        stripeCustomerId: input.stripeCustomerId ?? null,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      },
      update: {
        plan: input.plan,
        billingCycle: input.billingCycle,
        status: input.status,
        endDate: input.endDate,
        cancelledAt: null,
        paymentProvider: input.paymentProvider,
        stripeCustomerId: input.stripeCustomerId ?? undefined,
        stripeSubscriptionId: input.stripeSubscriptionId ?? undefined,
      },
    });
  }

  static async updateSubscriptionStatus(
    userId: string,
    status: SubscriptionStatus,
    endDate?: Date | null,
    cancelledAt?: Date | null,
  ) {
    const data: {
      status: SubscriptionStatus;
      endDate?: Date | null;
      cancelledAt?: Date | null;
    } = { status };

    if (endDate !== undefined) {
      data.endDate = endDate;
    }

    if (cancelledAt !== undefined) {
      data.cancelledAt = cancelledAt;
    } else if (status === "CANCELLED") {
      data.cancelledAt = new Date();
    }

    return prisma.subscription.update({
      where: { userId },
      data,
    });
  }

  static async downgradeToFree(userId: string, endDate?: Date | null) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return null;
    }

    return prisma.subscription.update({
      where: { userId },
      data: {
        status: "CANCELLED",
        cancelledAt: subscription.cancelledAt ?? new Date(),
        endDate: endDate ?? subscription.endDate,
      },
    });
  }

  static async findByStripeSubscriptionId(stripeSubscriptionId: string) {
    return prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });
  }

  static async getDailyLikeCount(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return prisma.like.count({
      where: {
        fromUserId: userId,
        createdAt: { gte: startOfDay },
      },
    });
  }
}
