import { prisma } from "../../../config/prisma";
import { AppError } from "../../errors/AppError";

export class LikeService {
  private static async getLikeCount(toUserId: string) {
    return prisma.like.count({
      where: { toUserId },
    });
  }

  static async createLike(fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) {
      throw new AppError("You cannot like yourself", 400);
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId,
        },
      },
    });

    if (existingLike) {
      throw new AppError("You already liked this user", 400);
    }

    const reverseLike = await prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: toUserId,
          toUserId: fromUserId,
        },
      },
    });

    const result = await prisma.$transaction(async (tx) => {
      await tx.like.create({
        data: {
          fromUserId,
          toUserId,
        },
      });

      let matchCreated = false;
      let match = null;

      if (reverseLike) {
        const [user1Id, user2Id] =
          fromUserId < toUserId
            ? [fromUserId, toUserId]
            : [toUserId, fromUserId];

        const existingMatch = await tx.match.findUnique({
          where: {
            user1Id_user2Id: {
              user1Id,
              user2Id,
            },
          },
        });

        if (!existingMatch) {
          match = await tx.match.create({
            data: {
              user1Id,
              user2Id,
            },
          });
          matchCreated = true;
        }
      }

      return {
        liked: true,
        matchCreated,
        match,
      };
    });

    const likeCount = await LikeService.getLikeCount(toUserId);

    return {
      ...result,
      likeCount,
    };
  }

  static async removeLike(fromUserId: string, toUserId: string) {
    const existingLike = await prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId,
        },
      },
    });

    if (!existingLike) {
      throw new AppError("You have not liked this user", 404);
    }

    const [user1Id, user2Id] =
      fromUserId < toUserId
        ? [fromUserId, toUserId]
        : [toUserId, fromUserId];

    await prisma.$transaction(async (tx) => {
      await tx.like.delete({
        where: {
          fromUserId_toUserId: {
            fromUserId,
            toUserId,
          },
        },
      });

      await tx.match.deleteMany({
        where: {
          user1Id,
          user2Id,
        },
      });
    });

    const likeCount = await LikeService.getLikeCount(toUserId);

    return {
      liked: false,
      likeCount,
    };
  }

  static async getReceivedLikes(userId: string) {
    const receivedLikes = await prisma.like.findMany({
      where: {
        toUserId: userId,
        fromUser: {
          deletedAt: null,
          isBlocked: false,
        },
      },
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            gender: true,
            profileImageUrl: true,
            birthDate: true,
            isOnline: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const myLikes = await prisma.like.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true },
    });
    const likedBackIds = new Set(myLikes.map((l) => l.toUserId));

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: { user1Id: true, user2Id: true },
    });
    const matchedIds = new Set(
      matches.map((m) => (m.user1Id === userId ? m.user2Id : m.user1Id)),
    );

    return receivedLikes
      .filter((like) => !matchedIds.has(like.fromUserId))
      .map((like) => ({
        likeId: like.id,
        likedAt: like.createdAt,
        isLikedBack: likedBackIds.has(like.fromUserId),
        user: like.fromUser,
      }));
  }
}
