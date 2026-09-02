-- Drop PayPal and Square subscription columns (Stripe-only payments)
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "paypalSubscriptionId";
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "squareCustomerId";
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "squareSubscriptionId";
