import { z } from "zod";

export const subscribeSchema = z.object({
  plan: z.enum(["STARTER", "PREMIUM", "ELITE"]),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
