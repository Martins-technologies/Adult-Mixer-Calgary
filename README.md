# AdultMixer Calgary

AdultMixer Calgary is a dating web application with account authentication, profile discovery and editing, likes that create matches, one-to-one match messaging, and email-verification support.

## Tech stack

Versions below are the dependency specifications declared in the repository's two `package.json` files.

### Frontend

| Technology | Declared version | Role |
| --- | --- | --- |
| React | `^19.2.0` | UI library |
| React DOM | `^19.2.0` | Browser rendering |
| Vite | `^7.2.4` | Development server and production bundler |
| JavaScript/JSX | No TypeScript package is declared for the frontend | Frontend source language (`src/**/*.jsx`) |
| React Router DOM | `^7.10.0` | Client-side routing |
| Tailwind CSS / `@tailwindcss/vite` | `^4.1.17` / `^4.1.17` | Styling and Vite integration |
| Axios | `^1.13.6` | HTTP client for the backend API |
| Framer Motion | `^12.34.3` | UI animation |

### Backend and database

| Technology | Declared version | Role |
| --- | --- | --- |
| Node.js | Not pinned (`engines` is not present) | Backend runtime; `@types/node` is declared as `^25.3.0` |
| TypeScript | `^5.9.3` | Backend source language |
| Express | `^5.2.1` | HTTP server and API routing |
| Prisma CLI / Prisma Client | `^6.19.2` / `^6.19.2` | Schema, migrations, and database access |
| PostgreSQL | Server version not pinned | Database provider configured in `backend/prisma/schema.prisma` |
| JSON Web Token | `^9.0.3` | Authentication tokens |
| bcrypt | `^6.0.0` | Password hashing |
| Resend | `^6.9.3` | Verification email delivery |

## Monorepo structure

```text
Adltmixer-Calgary/
â”œâ”€â”€ src/                         # Root React/Vite application
â”‚   â”œâ”€â”€ Pages/                   # Home, auth, discovery, matches, chat, and profile pages
â”‚   â”œâ”€â”€ Routes/                  # Client-side route definitions
â”‚   â”œâ”€â”€ components/              # Reusable page components and protected-route wrapper
â”‚   â”œâ”€â”€ context/                 # Authentication state and actions
â”‚   â””â”€â”€ services/                # Axios API client
â”œâ”€â”€ public/                      # Static frontend assets
â”œâ”€â”€ backend/                     # Independent Express/TypeScript application
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ config/              # Environment and Prisma setup
â”‚   â”‚   â”œâ”€â”€ core/modules/        # Auth, user, like, and message modules
â”‚   â”‚   â”œâ”€â”€ routes/              # Backend route composition
â”‚   â”‚   â”œâ”€â”€ app.ts               # Express middleware and /api mount
â”‚   â”‚   â””â”€â”€ server.ts            # HTTP server entry point
â”‚   â””â”€â”€ prisma/                  # PostgreSQL schema and migrations
â”œâ”€â”€ package.json                 # Frontend scripts and dependencies
â”œâ”€â”€ vite.config.js               # Vite and Tailwind plugin configuration
â””â”€â”€ vercel.json                  # Frontend Vercel build and SPA rewrite configuration

Runtime URL namespace (not a repository folder):
â””â”€â”€ /api                         # Express routes for auth, users, likes, and messages
```

- The repository root is the Vite frontend. Its `src/` folder contains the React UI, routing, authentication context, and API client; `public/` holds static files.
- `backend/` is a separately installed and run Express service. Prisma models users, likes, matches, messages, and email-verification tokens in PostgreSQL.
- There is no top-level `api/` directory. `/api` is the URL prefix mounted by `backend/src/app.ts`, with routes assembled in `backend/src/routes/index.ts`.

## Environment variables

The frontend reads its root `.env`; the backend calls `dotenv.config()` from `backend/src/config/env.ts`, so local backend variables belong in `backend/.env`. Copy the supplied example files before filling in real values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Do not commit real credentials.

### Frontend (`.env`)

| Variable | Where it is used | Fallback/default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `src/services/api.js` sets the Axios `baseURL` for all frontend API requests. The URL must include the `/api` suffix. | `http://localhost:5001/api` |

### Backend (`backend/.env`)

| Variable | Where it is used | Fallback/default |
| --- | --- | --- |
| `DATABASE_URL` | Required by `backend/src/config/env.ts`; Prisma reads it in `backend/prisma/schema.prisma` for the PostgreSQL datasource. | None; backend startup throws when it is missing. |
| `JWT_SECRET` | Required by `backend/src/config/env.ts`; signs tokens in `auth.service.ts` and verifies them in `auth.middleware.ts`. | None; backend startup throws when it is missing. |
| `JWT_EXPIRES_IN` | `backend/src/core/modules/auth/auth.service.ts` sets the lifetime of registration and login tokens. | `7d` |
| `PORT` | `backend/src/server.ts` selects the port on which Express listens. | `5001` |
| `FRONTEND_URL` | `backend/src/app.ts` adds the deployed frontend to the CORS allowlist; `email.service.ts` uses it to build verification links. | Empty string (`""`); local origins `http://localhost:5173`, `http://localhost:5001`, and `http://localhost:3000` remain allowed. |
| `NODE_ENV` | `backend/src/server.ts` reports the current runtime environment. | `development` |
| `RESEND_API_KEY` | `backend/src/config/env.ts` warns when absent; `email.service.ts` initializes Resend and sends verification emails when present. | Empty string (`""`); email delivery is skipped and the verification link is logged. |
| `DIRECT_URL` | Prisma `directUrl` for migrations (Neon and other pooled databases). | Required when using Neon; set to the non-pooled connection string. |
| `STRIPE_SECRET_KEY` | Stripe SDK initialization in `payments/stripe.service.ts`. | Required at startup. |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhook signatures. | Required at startup. |
| `STRIPE_PRICE_ID_STARTER` / `PREMIUM` / `ELITE` | Stripe Checkout line-item price IDs. | Required at startup. |

See `backend/.env.example` for placeholder values. **Stripe setup and sandbox testing:** see [STRIPE.md](./STRIPE.md).

## Local development

Prerequisites are Node.js/npm and a reachable PostgreSQL database. The repository does not pin a Node.js runtime version.

Install the frontend and backend dependencies:

```bash
# From the repository root
npm install
npm --prefix backend install
```

After configuring the environment files, apply the existing Prisma migrations:

```bash
npm --prefix backend run migrate:deploy
```

Run the two development servers together in separate terminals. These commands invoke the actual `dev` scripts in each `package.json`:

```bash
# Terminal 1 â€” Vite frontend (repository root)
npm run dev
```

```bash
# Terminal 2 â€” Express backend
npm --prefix backend run dev
```

By default, Vite serves the frontend at `http://localhost:5173`, and the backend listens at `http://localhost:5001` with API routes under `http://localhost:5001/api`.

Production builds can be checked independently with:

```bash
npm run build
npm --prefix backend run build
```

The backend production entry point is run by `npm --prefix backend start` after a successful backend build.

---

## Payments (Stripe)

This app uses **Stripe Checkout** for subscriptions. Tiers are unlocked only after Stripe sends a verified webhook - never from the frontend redirect alone.

| Tier | Yearly price |
| --- | --- |
| Starter | $29.99/yr |
| Premium | $59.99/yr |
| Elite | $99.99/yr |

**Flow:** `/pricing` -> `/checkout` -> Stripe hosted page -> `/payments/success` (polls until webhook confirms) -> tier active.

**API routes:**

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/payments/stripe/checkout-session` | Start checkout (JWT) |
| `POST` | `/api/payments/webhooks/stripe` | Stripe webhooks (signature verified) |
| `GET` | `/api/payments/subscription` | Current tier/status |
| `POST` | `/api/payments/cancel` | Cancel subscription |

Plan features and gating rules: `backend/src/core/modules/payments/plans.config.ts`.

**Full Stripe setup and sandbox testing guide:** [STRIPE.md](./STRIPE.md)

---

## Deployment

The root frontend is configured to deploy to Vercel using `npm run build`, the `dist` output directory, and the Vite framework preset from `vercel.json`.

The Express/Prisma backend must be deployed as a separate service with PostgreSQL and the backend environment variables above. It is currently **not deployed** because access to the previous Railway deployment was lost. Once a new backend is available, point the Vercel frontend at its public `/api` URL by setting `VITE_API_BASE_URL` in the Vercel project's environment variables and redeploying the frontend.

## Known issues / TODO

- Re-deploy the backend to a separately hosted Node.js service; the previous Railway deployment is unavailable because access was lost.
- Set `VITE_API_BASE_URL` in Vercel environment variables to the new backend's public URL, including `/api`.
- Review the catch-all rewrite in `vercel.json` (`/(.*)` to `/`) to confirm it is the intended SPA routing behavior and does not mask assets or future server/API routes.
 