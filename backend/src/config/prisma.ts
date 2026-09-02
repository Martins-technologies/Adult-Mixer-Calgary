import { PrismaClient } from "@prisma/client";

const RETRYABLE_CODES = new Set(["P1001", "P1017"]);

function isRetryableDatabaseError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const code =
    "code" in error ? String((error as { code: unknown }).code) : "";
  if (RETRYABLE_CODES.has(code)) return true;

  const message =
    "message" in error ? String((error as { message: unknown }).message) : "";
  return message.includes("Can't reach database server");
}

async function withDatabaseRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 4,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryableDatabaseError(error) || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = 2000 * attempt;
      console.warn(
        `Database unreachable (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export const prisma = basePrisma;

export async function connectDatabase(): Promise<void> {
  await withDatabaseRetry(async () => {
    await basePrisma.$connect();
    await basePrisma.$queryRaw`SELECT 1`;
  }, 5);

  console.log("✅ Database connected");
}

export function startDatabaseKeepAlive(): void {
  if (process.env.NODE_ENV !== "development") return;

  const intervalMs = 4 * 60 * 1000;

  setInterval(async () => {
    try {
      await basePrisma.$queryRaw`SELECT 1`;
    } catch (error) {
      console.warn("Database keep-alive ping failed:", error);
    }
  }, intervalMs);

  console.log("💓 Database keep-alive enabled (every 4 minutes in development)");
}
