import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "./AppError";

function isDatabaseUnavailableError(err: Error): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    (err.code === "P1001" || err.code === "P1017" || err.code === "P2024")
  ) {
    return true;
  }

  return err.message.includes("Can't reach database server");
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => issue.message).join(", ");
    return res.status(400).json({
      status: "error",
      message,
    });
  }

  if (isDatabaseUnavailableError(err)) {
    return res.status(503).json({
      status: "error",
      message:
        "Database is waking up. Please wait a few seconds and try again.",
    });
  }

  console.error("UNEXPECTED ERROR:", err);

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};