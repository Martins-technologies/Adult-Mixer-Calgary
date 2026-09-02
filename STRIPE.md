# Stripe Integration Guide — AdultMixer Calgary

Complete step-by-step guide to configure Stripe, connect it to this codebase, and test subscriptions in **sandbox (test mode)**.

---

## Table of contents

1. [How payments work in this app](#1-how-payments-work-in-this-app)
2. [Prerequisites](#2-prerequisites)
3. [Step 1 — Create a Stripe account](#3-step-1--create-a-stripe-account)
4. [Step 2 — Create products and prices](#4-step-2--create-products-and-prices)
5. [Step 3 — Get your API keys](#5-step-3--get-your-api-keys)
6. [Step 4 — Configure backend environment variables](#6-step-4--configure-backend-environment-variables)
7. [Step 5 — Install Stripe CLI and forward webhooks](#7-step-5--install-stripe-cli-and-forward-webhooks)
8. [Step 6 — Start the app](#8-step-6--start-the-app)
9. [Step 7 — Run a sandbox test payment](#9-step-7--run-a-sandbox-test-payment)
10. [Step 8 — Verify the subscription activated](#10-step-8--verify-the-subscription-activated)
11. [Step 9 — Test cancellation](#11-step-9--test-cancellation)
12. [Step 10 — Test webhook security](#12-step-10--test-webhook-security)
13. [Production deployment checklist](#13-production-deployment-checklist)
14. [Troubleshooting](#14-troubleshooting)
15. [Reference — files and endpoints](#15-reference--files-and-endpoints)

---

## 1. How payments work in this app

**Security rule:** The frontend never unlocks a subscription. Stripe confirms payment via a signed webhook.

```text
User → /pricing → /checkout → "Pay with Stripe"
         ↓
Backend POST /api/payments/stripe/checkout-session
         ↓
Stripe Checkout (hosted page — card never hits our server)
         ↓
User pays with test card
         ↓
Stripe sends webhook → POST /api/payments/webhooks/stripe
         ↓
Backend verifies signature → updates Subscription in PostgreSQL
         ↓
User redirected to /payments/success → polls until tier is ACTIVE
```

### Subscription tiers

| Plan ID | Name | Yearly price | Stripe env var |
| --- | --- | --- | --- |
| `STARTER` | Starter | $29.99/yr | `STRIPE_PRICE_ID_STARTER` |
| `PREMIUM` | Premium | $59.99/yr | `STRIPE_PRICE_ID_PREMIUM` |
| `ELITE` | Elite | $99.99/yr | `STRIPE_PRICE_ID_ELITE` |

Feature flags (likes/day, messaging, etc.) are defined in:

`backend/src/core/modules/payments/plans.config.ts`

---

## 2. Prerequisites

Before you start, make sure you have:

- [ ] Node.js and npm installed
- [ ] PostgreSQL running (or Neon database configured in `backend/.env`)
- [ ] This repo cloned and dependencies installed:

```bash
npm install
npm --prefix backend install
```

- [ ] Database migrations applied:

```bash
npm --prefix backend run migrate:deploy
```

- [ ] A test user account in the app (sign up at http://localhost:5173/signup)

- [ ] **Stripe CLI** installed: https://stripe.com/docs/stripe-cli#install

---

## 3. Step 1 — Create a Stripe account

1. Go to https://dashboard.stripe.com/register
2. Complete registration
3. Open the Stripe Dashboard
4. **Turn on Test mode** — toggle in the top-right corner (orange **Test mode** badge)

> Always develop with test mode ON. Never use live keys (`sk_live_...`) during local development.

---

## 4. Step 2 — Create products and prices

The backend maps each plan to a Stripe **Price ID** (`price_...`).

### 4.1 Create three products

In Stripe Dashboard → **Product catalog** → **+ Add product**:

| Product name | Description | Price type | Amount | Billing |
| --- | --- | --- | --- | --- |
| AdultMixer Starter | Starter subscription | Recurring | $29.99 | Yearly |
| AdultMixer Premium | Premium subscription | Recurring | $59.99 | Yearly |
| AdultMixer Elite | Elite subscription | Recurring | $99.99 | Yearly |

For each product:

1. Click **Add product**
2. Enter name and description
3. Under **Pricing**, choose **Recurring**
4. Set amount and **Yearly** billing period
5. Click **Save product**
6. Copy the **Price ID** (starts with `price_...`) from the product page

### 4.2 Monthly billing (optional)

If you want to test **monthly** billing from the pricing page toggle:

- Create additional monthly prices ($2.99, $5.99, $9.99)
- Point the env vars to the monthly price IDs when testing monthly checkout

> The app passes one price ID per plan from env. Swap the IDs when switching between monthly/yearly tests, or create separate env vars for monthly prices if you extend the config later.

### 4.3 Record your Price IDs

You will need these in Step 4:

```text
STRIPE_PRICE_ID_STARTER=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_ID_PREMIUM=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_ID_ELITE=price_xxxxxxxxxxxxxxxx
```

---

## 5. Step 3 — Get your API keys

1. Stripe Dashboard → **Developers** → **API keys**
2. Ensure **Test mode** is ON
3. Copy the **Secret key** (`sk_test_...`)

```text
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
```

> Never commit real keys to git. Keep them in `backend/.env` only.

---

## 6. Step 4 — Configure backend environment variables

Edit `backend/.env`:

```env
# Required — database & auth (you should already have these)
DATABASE_URL="your-postgresql-url"
DIRECT_URL="your-direct-postgresql-url"
JWT_SECRET="your-jwt-secret"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT=5001

# Stripe — fill in from Steps 2 and 3
STRIPE_SECRET_KEY="sk_test_xxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxx"   # Step 5 — leave placeholder until Stripe CLI gives you one
STRIPE_PRICE_ID_STARTER="price_xxxxxxxx"
STRIPE_PRICE_ID_PREMIUM="price_xxxxxxxx"
STRIPE_PRICE_ID_ELITE="price_xxxxxxxx"
```

You can copy the template from `backend/.env.example`.

**Restart the backend** whenever you change `.env`.

---

## 7. Step 5 — Install Stripe CLI and forward webhooks

Webhooks are how Stripe tells your backend that payment succeeded. Locally, the Stripe CLI forwards events to your machine.

### 7.1 Install and log in

```bash
# Windows (scoop)
scoop install stripe

# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli#install
```

Log in:

```bash
stripe login
```

### 7.2 Forward webhooks to your backend

Open a **dedicated terminal** (Terminal 3) and run:

```bash
stripe listen --forward-to localhost:5001/api/payments/webhooks/stripe
```

You will see output like:

```text
Ready! Your webhook signing secret is whsec_abc123xyz...
```

**Copy that `whsec_...` value** into `backend/.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_abc123xyz..."
```

**Restart the backend** (Terminal 2) so it loads the new webhook secret.

> **Important:** When using `stripe listen`, use the `whsec_` secret from the CLI output — **not** the webhook secret from the Stripe Dashboard (unless you registered a Dashboard webhook pointing to a public URL).

### 7.3 Keep the CLI running

Leave `stripe listen` running for the entire test session. If you stop it, webhooks won't reach your backend and subscriptions won't activate.

---

## 8. Step 6 — Start the app

You need **three terminals** for a full test:

| Terminal | Command | Purpose |
| --- | --- | --- |
| 1 | `npm run dev` | Frontend → http://localhost:5173 |
| 2 | `npm --prefix backend run dev` | Backend → http://localhost:5001 |
| 3 | `stripe listen --forward-to localhost:5001/api/payments/webhooks/stripe` | Webhook forwarding |

Verify backend is healthy:

```bash
curl http://localhost:5001/health
```

Expected: `{"status":"ok",...}`

---

## 9. Step 7 — Run a sandbox test payment

### 9.1 Go through checkout

1. Log in to the app
2. Open http://localhost:5173/pricing
3. Choose **Yearly** (or Monthly) billing toggle
4. Click **Get Started Now** on any plan (e.g. Premium)
5. On `/checkout`, review the plan summary
6. Click **Pay with Stripe**
7. Browser redirects to **Stripe Checkout**

### 9.2 Pay with a Stripe test card

On the Stripe Checkout page, enter:

| Field | Test value |
| --- | --- |
| Email | Any email (e.g. your test user email) |
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g. `12/34`) |
| CVC | Any 3 digits (e.g. `123`) |
| Name | Any name |
| ZIP / Postal | Any valid value (e.g. `12345`) |

Click **Subscribe** / **Pay**.

More test cards: https://stripe.com/docs/testing#cards

| Card number | Scenario |
| --- | --- |
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 3220` | 3D Secure authentication |

### 9.3 Watch webhook delivery

In Terminal 3 (`stripe listen`), you should see:

```text
checkout.session.completed [200]
customer.subscription.created [200]
invoice.payment_succeeded [200]
```

`[200]` means your backend accepted and processed the event.

### 9.4 Success redirect

Stripe redirects to:

```text
http://localhost:5173/payments/success?provider=stripe&session_id=cs_test_...
```

The page shows **"Confirming your payment..."** then **"Subscription Active!"** once the webhook has been processed (usually 2–10 seconds).

---

## 10. Step 8 — Verify the subscription activated

### 10.1 Frontend checks

| Location | Expected |
| --- | --- |
| `/payments/success` | "Subscription Active!" with plan name |
| `/profile` → Subscription section | Plan name, status Active, "via stripe", renewal date |
| Premium features | e.g. unlimited likes, messaging (depends on plan) |

### 10.2 API check

Get your JWT from browser DevTools → Application → Local Storage → `token`:

```bash
curl http://localhost:5001/api/payments/subscription \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected (example for Premium):

```json
{
  "tier": "PREMIUM",
  "status": "ACTIVE",
  "plan": "PREMIUM",
  "paymentProvider": "STRIPE",
  "endDate": "2027-...",
  "featureFlags": {
    "messaging": true,
    "likesPerDay": null,
    ...
  }
}
```

### 10.3 Database check

```bash
npm --prefix backend exec prisma studio
```

Open tables:

- **`Subscription`** — row for your user with `plan`, `status: ACTIVE`, `stripeCustomerId`, `stripeSubscriptionId`
- **`PaymentTransaction`** — row with `provider: STRIPE`, `status: SUCCEEDED`

### 10.4 Stripe Dashboard check

In **Test mode**:

- **Payments** → payment succeeded
- **Customers** → customer with your user's email
- **Subscriptions** → active subscription on the correct price

### 10.5 Security check — no payment = no upgrade

1. Log in as a **different** user (or stay logged out)
2. Navigate directly to: http://localhost:5173/payments/success?provider=stripe
3. Page should **not** show "Subscription Active!" for a paid tier
4. `GET /api/payments/subscription` should return `"tier": "FREE"`

---

## 11. Step 9 — Test cancellation

1. Go to http://localhost:5173/profile
2. Scroll to **Subscription**
3. Click **Cancel Subscription**
4. Confirm the dialog

Expected:

- Toast: subscription will cancel at end of billing period
- Stripe Dashboard → subscription shows **Cancel at period end**
- Profile shows cancelled status; access continues until `endDate`

Backend calls Stripe API with `cancel_at_period_end: true`.

---

## 12. Step 10 — Test webhook security

Send a forged webhook — the backend must reject it:

```bash
curl -X POST http://localhost:5001/api/payments/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=1234567890,v1=fake_signature" \
  -d "{\"type\":\"checkout.session.completed\",\"data\":{\"object\":{\"id\":\"fake\"}}}"
```

**Expected:** HTTP `400` with `"Invalid Stripe webhook signature"`  
**Must not:** Upgrade any user's subscription

---

## 13. Production deployment checklist

When you go live, switch from sandbox to production:

- [ ] Turn off Stripe **Test mode** in Dashboard
- [ ] Replace `sk_test_...` with `sk_live_...` in production env
- [ ] Create **live** products/prices (or copy test products to live)
- [ ] Register a **production webhook** in Stripe Dashboard:
  - URL: `https://YOUR-API-DOMAIN/api/payments/webhooks/stripe`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Copy the **live** webhook signing secret → `STRIPE_WEBHOOK_SECRET` in production env
- [ ] Set `FRONTEND_URL` to your production frontend URL (no trailing slash)
- [ ] Set `VITE_API_BASE_URL` on Vercel to your production API URL
- [ ] Do **not** use `stripe listen` in production — Stripe sends webhooks directly to your public URL

---

## 14. Troubleshooting

| Problem | Cause | Fix |
| --- | --- | --- |
| Backend crashes on start | Missing Stripe env var | Fill all 5 Stripe vars in `backend/.env` |
| "Stripe price not configured" | Wrong or missing Price ID | Copy `price_...` IDs from Dashboard → env vars |
| Checkout button fails | Invalid `STRIPE_SECRET_KEY` | Use `sk_test_...` with Test mode ON |
| Stuck on "Confirming payment..." | Webhook not received | Ensure `stripe listen` is running; check Terminal 3 for errors |
| Webhook returns 400 | Wrong `STRIPE_WEBHOOK_SECRET` | Use `whsec_` from `stripe listen` output, restart backend |
| CORS error | Wrong `FRONTEND_URL` | Set `FRONTEND_URL=http://localhost:5173` |
| Tier not updating after 60s | Webhook handler error | Check backend Terminal 2 logs; verify user metadata in Stripe session |
| "Direct subscription is disabled" | Old mock subscribe API | Use `/checkout` → Pay with Stripe |

### Useful Stripe CLI commands

```bash
# List recent events
stripe events list --limit 5

# Trigger a test event (synthetic — not tied to real checkout)
stripe trigger checkout.session.completed

# View webhook logs in Dashboard
# Developers → Webhooks → [your endpoint] → Event deliveries
```

---

## 15. Reference — files and endpoints

### Backend files

| File | Purpose |
| --- | --- |
| `backend/src/core/modules/payments/stripe.service.ts` | Checkout sessions, webhook handling, cancel |
| `backend/src/core/modules/payments/subscription.service.ts` | Apply tier to DB, audit log |
| `backend/src/core/modules/payments/plans.config.ts` | Plan prices and feature flags |
| `backend/src/core/modules/payments/payments.controller.ts` | HTTP handlers |
| `backend/src/core/modules/payments/payments.routes.ts` | Route definitions |
| `backend/src/config/env.ts` | Stripe env validation |
| `backend/src/app.ts` | Raw body parser for Stripe webhook |

### Frontend files

| File | Purpose |
| --- | --- |
| `src/Pages/Checkout.jsx` | Plan review + "Pay with Stripe" button |
| `src/Pages/PaymentSuccess.jsx` | Polls until webhook confirms tier |
| `src/Pages/PaymentCancel.jsx` | Cancelled checkout page |
| `src/Pages/UserProfile.jsx` | Subscription status + cancel button |
| `src/services/payments.js` | API helpers |

### API endpoints

| Method | Path | Auth |
| --- | --- | --- |
| `POST` | `/api/payments/stripe/checkout-session` | JWT required |
| `POST` | `/api/payments/webhooks/stripe` | Stripe signature |
| `GET` | `/api/payments/subscription` | JWT required |
| `POST` | `/api/payments/cancel` | JWT required |

### Webhook events handled

| Stripe event | Action |
| --- | --- |
| `checkout.session.completed` | Activate subscription tier |
| `customer.subscription.updated` | Sync status and renewal date |
| `customer.subscription.deleted` | Mark subscription cancelled |
| `invoice.payment_failed` | Set status `PAST_DUE`, log failure |

---

## Quick start cheat sheet

```bash
# 1. Configure backend/.env with sk_test_ key and price_ IDs

# 2. Terminal 1 — frontend
npm run dev

# 3. Terminal 2 — backend
npm --prefix backend run dev

# 4. Terminal 3 — webhooks
stripe listen --forward-to localhost:5001/api/payments/webhooks/stripe
# Copy whsec_... → STRIPE_WEBHOOK_SECRET in .env → restart backend

# 5. Test
# → http://localhost:5173/pricing → checkout → Pay with Stripe
# → Card: 4242 4242 4242 4242
# → Wait for "Subscription Active!"
```
