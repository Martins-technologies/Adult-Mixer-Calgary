import { z } from "zod";

export const checkoutSchema = z.object({
  plan: z.enum(["STARTER", "PREMIUM", "ELITE"]),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("YEARLY"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
