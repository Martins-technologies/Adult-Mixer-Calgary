import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL"] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`${key} is not defined in .env`);
  }
}

const stripeEnvVars = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID_STARTER_MONTHLY",
  "STRIPE_PRICE_ID_STARTER_YEARLY",
  "STRIPE_PRICE_ID_PREMIUM_MONTHLY",
  "STRIPE_PRICE_ID_PREMIUM_YEARLY",
  "STRIPE_PRICE_ID_ELITE_MONTHLY",
  "STRIPE_PRICE_ID_ELITE_YEARLY",
] as const;

for (const key of stripeEnvVars) {
  if (!process.env[key]) {
    throw new Error(`${key} is not defined in .env`);
  }
}

if (!process.env.RESEND_API_KEY) {
  console.warn(
    "⚠️  RESEND_API_KEY is not set - Email verification will not work!",
  );
}

export const env = {
  PORT: process.env.PORT || "5001",
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || "support@adultmixercalgary.com",

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  STRIPE_WEBHOOK_SECRET: (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim(),
  STRIPE_PRICE_ID_STARTER_MONTHLY: process.env
    .STRIPE_PRICE_ID_STARTER_MONTHLY as string,
  STRIPE_PRICE_ID_STARTER_YEARLY: process.env
    .STRIPE_PRICE_ID_STARTER_YEARLY as string,
  STRIPE_PRICE_ID_PREMIUM_MONTHLY: process.env
    .STRIPE_PRICE_ID_PREMIUM_MONTHLY as string,
  STRIPE_PRICE_ID_PREMIUM_YEARLY: process.env
    .STRIPE_PRICE_ID_PREMIUM_YEARLY as string,
  STRIPE_PRICE_ID_ELITE_MONTHLY: process.env
    .STRIPE_PRICE_ID_ELITE_MONTHLY as string,
  STRIPE_PRICE_ID_ELITE_YEARLY: process.env
    .STRIPE_PRICE_ID_ELITE_YEARLY as string,
};
