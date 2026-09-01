import { prisma } from "../../../config/prisma";
import { AppError } from "../../errors/AppError";

export class SkipService {
  static async createSkip(fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) {
      throw new AppError("You cannot skip yourself", 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, deletedAt: true, isBlocked: true },
    });

    if (!targetUser || targetUser.deletedAt || targetUser.isBlocked) {
      throw new AppError("User not found", 404);
    }

    const existingSkip = await prisma.skip.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId,
        },
      },
    });

    if (existingSkip) {
      return { skipped: true };
    }

    await prisma.skip.create({
      data: {
        fromUserId,
        toUserId,
      },
    });

    return { skipped: true };
  }
}
