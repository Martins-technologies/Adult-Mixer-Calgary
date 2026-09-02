import Stripe from "stripe";
import { BillingCycle, SubscriptionPlan } from "@prisma/client";
import { env } from "../../../config/env";
import { prisma } from "../../../config/prisma";
import { AppError } from "../../errors/AppError";
import { getPlanPrice, getPriceId } from "./plans.config";
import { PaymentSubscriptionService } from "./subscription.service";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-08-26.dahlia",
});

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const periodEnd = (
    subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;
  return periodEnd ? new Date(periodEnd * 1000) : null;
}

export class StripePaymentService {
  static async getOrCreateStripeCustomer(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
  }): Promise<string> {
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    });

    if (existingSubscription?.stripeCustomerId) {
      return existingSubscription.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName ?? ""}`.trim(),
      metadata: { userId: user.id },
    });

    return customer.id;
  }

  static async createCheckoutSession(
    userId: string,
    plan: SubscriptionPlan,
    billingCycle: BillingCycle,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const priceId = getPriceId(plan, billingCycle);
    if (!priceId) {
      throw new AppError("Stripe price not configured for this plan", 500);
    }

    const customerId = await StripePaymentService.getOrCreateStripeCustomer({
      id: userId,
      ...user,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.FRONTEND_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${env.FRONTEND_URL}/payments/cancel`,
      metadata: {
        userId,
        plan,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
          billingCycle,
        },
      },
    });

    if (!session.url) {
      throw new AppError("Failed to create Stripe checkout session", 500);
    }

    return { url: session.url, sessionId: session.id };
  }

  static constructWebhookEvent(rawBody: Buffer, signature: string) {
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  }

  static async confirmCheckoutSession(userId: string, sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.metadata?.userId !== userId) {
      throw new AppError("Checkout session does not belong to this user", 403);
    }

    if (session.payment_status !== "paid" && session.status !== "complete") {
      throw new AppError("Payment has not been completed yet", 400);
    }

    await StripePaymentService.handleCheckoutCompleted(session);

    return PaymentSubscriptionService.getUserSubscription(userId);
  }

  static async handleWebhookEvent(event: Stripe.Event) {
    if (await PaymentSubscriptionService.isWebhookEventProcessed(event.id)) {
      return;
    }

    const userId = await StripePaymentService.resolveUserIdFromEvent(event);

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await StripePaymentService.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
          await StripePaymentService.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;
        case "customer.subscription.deleted":
          await StripePaymentService.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;
        case "invoice.payment_failed":
          await StripePaymentService.handlePaymentFailed(
            event.data.object as Stripe.Invoice,
          );
          break;
        default:
          break;
      }

      if (userId) {
        await PaymentSubscriptionService.logWebhookEvent({
          userId,
          stripeEventId: event.id,
          eventType: event.type,
          status: "processed",
          rawPayload: event,
        });
      }
    } catch (error) {
      if (userId) {
        await PaymentSubscriptionService.logWebhookEvent({
          userId,
          stripeEventId: event.id,
          eventType: event.type,
          status: "failed",
          rawPayload: { event, error: String(error) },
        });
      }
      throw error;
    }
  }

  private static async resolveUserIdFromEvent(
    event: Stripe.Event,
  ): Promise<string | null> {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return session.metadata?.userId ?? null;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const record =
          await PaymentSubscriptionService.findByStripeSubscriptionId(
            subscription.id,
          );
        return record?.userId ?? subscription.metadata?.userId ?? null;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
        };
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        if (!subscriptionId) return null;
        const record =
          await PaymentSubscriptionService.findByStripeSubscriptionId(
            subscriptionId,
          );
        return record?.userId ?? null;
      }
      default:
        return null;
    }
  }

  private static async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as SubscriptionPlan | undefined;
    const billingCycle = session.metadata?.billingCycle as
      | BillingCycle
      | undefined;

    if (!userId || !plan || !billingCycle) {
      return;
    }

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    const stripeSubscription = subscriptionId
      ? await stripe.subscriptions.retrieve(subscriptionId)
      : null;

    const endDate = stripeSubscription
      ? getSubscriptionPeriodEnd(stripeSubscription)
      : null;

    await PaymentSubscriptionService.applySubscription({
      userId,
      plan,
      billingCycle,
      status: "ACTIVE",
      endDate,
      paymentProvider: "STRIPE",
      stripeCustomerId:
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id,
      stripeSubscriptionId: subscriptionId ?? null,
    });

    await PaymentSubscriptionService.logTransaction({
      userId,
      provider: "STRIPE",
      providerTransactionId: `checkout_${session.id}`,
      amount: getPlanPrice(plan, billingCycle),
      plan,
      status: "SUCCEEDED",
      rawPayload: session,
    });
  }

  private static async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ) {
    let record = await PaymentSubscriptionService.findByStripeSubscriptionId(
      subscription.id,
    );

    if (!record && subscription.metadata?.userId) {
      const plan = subscription.metadata.plan as SubscriptionPlan | undefined;
      const billingCycle = subscription.metadata.billingCycle as
        | BillingCycle
        | undefined;

      if (plan && billingCycle && subscription.status === "active") {
        const endDate = getSubscriptionPeriodEnd(subscription);
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        await PaymentSubscriptionService.applySubscription({
          userId: subscription.metadata.userId,
          plan,
          billingCycle,
          status: "ACTIVE",
          endDate,
          paymentProvider: "STRIPE",
          stripeCustomerId: customerId ?? null,
          stripeSubscriptionId: subscription.id,
        });

        record = await PaymentSubscriptionService.findByStripeSubscriptionId(
          subscription.id,
        );
      }
    }

    if (!record) {
      return;
    }

    const endDate = getSubscriptionPeriodEnd(subscription);
    let status = record.status;

    if (subscription.status === "active") {
      status = "ACTIVE";
    } else if (subscription.status === "past_due") {
      status = "PAST_DUE";
    } else if (
      subscription.status === "canceled" ||
      subscription.status === "unpaid"
    ) {
      status = "CANCELLED";
    }

    const cancelledAt = subscription.cancel_at_period_end
      ? record.cancelledAt ?? new Date()
      : record.cancelledAt;

    await PaymentSubscriptionService.updateSubscriptionStatus(
      record.userId,
      status,
      endDate,
      cancelledAt,
    );
  }

  private static async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ) {
    const record = await PaymentSubscriptionService.findByStripeSubscriptionId(
      subscription.id,
    );

    if (!record) {
      return;
    }

    const endDate = getSubscriptionPeriodEnd(subscription);
    await PaymentSubscriptionService.downgradeToFree(record.userId, endDate);
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice) {
    const invoiceData = invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    };

    const subscriptionId =
      typeof invoiceData.subscription === "string"
        ? invoiceData.subscription
        : invoiceData.subscription?.id;

    if (!subscriptionId) {
      return;
    }

    const record = await PaymentSubscriptionService.findByStripeSubscriptionId(
      subscriptionId,
    );

    if (!record) {
      return;
    }

    await PaymentSubscriptionService.updateSubscriptionStatus(
      record.userId,
      "PAST_DUE",
    );

    await PaymentSubscriptionService.logTransaction({
      userId: record.userId,
      provider: "STRIPE",
      providerTransactionId: `invoice_${invoice.id}`,
      amount: (invoice.amount_due ?? 0) / 100,
      plan: record.plan,
      status: "FAILED",
      rawPayload: invoice,
    });
  }

  static async cancelSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new AppError("No Stripe subscription found", 404);
    }

    if (subscription.cancelledAt) {
      throw new AppError("Subscription is already scheduled for cancellation", 400);
    }

    const updated = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true },
    );

    const endDate = getSubscriptionPeriodEnd(updated) ?? subscription.endDate;

    await prisma.subscription.update({
      where: { userId },
      data: {
        cancelledAt: new Date(),
        endDate,
      },
    });

    return {
      message:
        "Your subscription will cancel at the end of the current billing period. You keep access until then.",
      endDate,
    };
  }
}
