import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler } from "./core/errors/errorHandler";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { PaymentsController } from "./core/modules/payments/payments.controller";

export const app = express();

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5001",
  "http://localhost:3000",
];

if (env.FRONTEND_URL) {
  allowedOrigins.push(
    ...env.FRONTEND_URL.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

console.log("✅ CORS allowed origins:", allowedOrigins);

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`🚫 CORS blocked request from origin: ${origin}`);
      callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Stripe webhook requires raw body for signature verification
app.post(
  "/api/payments/webhooks/stripe",
  express.raw({ type: "application/json" }),
  PaymentsController.handleStripeWebhook,
);

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
      allowedOrigins,
    });
  } catch {
    res.status(503).json({
      status: "degraded",
      database: "unreachable",
      timestamp: new Date().toISOString(),
      message:
        "Database is waking up or unreachable. Wait a few seconds and retry.",
    });
  }
});

app.use("/api", routes);

app.use(errorHandler);
