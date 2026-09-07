import { prisma } from "../../../config/prisma";
import { Prisma, Preference } from "@prisma/client";
import { AppError } from "../../errors/AppError";
import {
  isProfileComplete,
  MatchingUser,
} from "../matching/matching.utils";
import { PaymentSubscriptionService } from "../payments/subscription.service";

const profileSelect = {
  id: true,
  email: true,
  role: true,
  emailVerified: true,
  firstName: true,
  lastName: true,
  bio: true,
  birthDate: true,
  gender: true,
  preference: true,
  profileImageUrl: true,
  sexualOrientation: true,
  relationshipStatus: true,
  ethnicity: true,
  religion: true,
  educationLevel: true,
  bodyType: true,
  hasChildren: true,
  wantsChildren: true,
  diet: true,
  drinking: true,
  smoking: true,
  drugs: true,
  pets: true,
  language: true,
  city: true,
  latitude: true,
  longitude: true,
  prefMinAge: true,
  prefMaxAge: true,
  prefEthnicity: true,
  prefReligion: true,
  prefEducationLevel: true,
  prefLanguage: true,
  prefMaxDistanceKm: true,
  profileCompletedAt: true,
  isOnline: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UserService {
  static async getById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    });

    if (!user) return null;

    return {
      ...user,
      profileComplete: isProfileComplete(user as MatchingUser),
    };
  }

  static async updateById(userId: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: profileSelect,
    });
  }

  static async updateMyProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      profileImageUrl?: string;
      preference?: Preference;
      sexualOrientation?: Prisma.UserUpdateInput["sexualOrientation"];
      relationshipStatus?: Prisma.UserUpdateInput["relationshipStatus"];
      ethnicity?: Prisma.UserUpdateInput["ethnicity"];
      religion?: Prisma.UserUpdateInput["religion"];
      educationLevel?: Prisma.UserUpdateInput["educationLevel"];
      bodyType?: Prisma.UserUpdateInput["bodyType"];
      hasChildren?: boolean;
      wantsChildren?: Prisma.UserUpdateInput["wantsChildren"];
      diet?: Prisma.UserUpdateInput["diet"];
      drinking?: Prisma.UserUpdateInput["drinking"];
      smoking?: Prisma.UserUpdateInput["smoking"];
      drugs?: Prisma.UserUpdateInput["drugs"];
      pets?: Prisma.UserUpdateInput["pets"];
      language?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
      prefMinAge?: number;
      prefMaxAge?: number;
      prefEthnicity?: Prisma.UserUpdateInput["prefEthnicity"];
      prefReligion?: Prisma.UserUpdateInput["prefReligion"];
      prefEducationLevel?: Prisma.UserUpdateInput["prefEducationLevel"];
      prefLanguage?: string | null;
      prefMaxDistanceKm?: number;
      birthDate?: string;
    },
  ) {
    const updateData: Prisma.UserUpdateInput = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.profileImageUrl !== undefined)
      updateData.profileImageUrl = data.profileImageUrl;
    if (data.preference !== undefined) updateData.preference = data.preference;
    if (data.sexualOrientation !== undefined)
      updateData.sexualOrientation = data.sexualOrientation;
    if (data.relationshipStatus !== undefined)
      updateData.relationshipStatus = data.relationshipStatus;
    if (data.ethnicity !== undefined) updateData.ethnicity = data.ethnicity;
    if (data.religion !== undefined) updateData.religion = data.religion;
    if (data.educationLevel !== undefined)
      updateData.educationLevel = data.educationLevel;
    if (data.bodyType !== undefined) updateData.bodyType = data.bodyType;
    if (data.hasChildren !== undefined) updateData.hasChildren = data.hasChildren;
    if (data.wantsChildren !== undefined)
      updateData.wantsChildren = data.wantsChildren;
    if (data.diet !== undefined) updateData.diet = data.diet;
    if (data.drinking !== undefined) updateData.drinking = data.drinking;
    if (data.smoking !== undefined) updateData.smoking = data.smoking;
    if (data.drugs !== undefined) updateData.drugs = data.drugs;
    if (data.pets !== undefined) updateData.pets = data.pets;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.prefMinAge !== undefined) updateData.prefMinAge = data.prefMinAge;
    if (data.prefMaxAge !== undefined) updateData.prefMaxAge = data.prefMaxAge;

    // Distance is a core onboarding preference (required for profileComplete).
    // Elite-only filters are ethnicity / religion / education.
    const wantsAdvancedFilters =
      data.prefEthnicity !== undefined ||
      data.prefReligion !== undefined ||
      data.prefEducationLevel !== undefined;

    if (wantsAdvancedFilters) {
      const hasAdvancedFilters = await PaymentSubscriptionService.hasFeature(
        userId,
        "advancedFilters",
      );
      if (!hasAdvancedFilters) {
        throw new AppError(
          "Upgrade to Elite to use advanced filters",
          403,
        );
      }
    }

    if (data.prefEthnicity !== undefined)
      updateData.prefEthnicity = data.prefEthnicity;
    if (data.prefReligion !== undefined)
      updateData.prefReligion = data.prefReligion;
    if (data.prefEducationLevel !== undefined)
      updateData.prefEducationLevel = data.prefEducationLevel;
    if (data.prefLanguage !== undefined)
      updateData.prefLanguage = data.prefLanguage;
    if (data.prefMaxDistanceKm !== undefined)
      updateData.prefMaxDistanceKm = data.prefMaxDistanceKm;
    if (data.birthDate !== undefined)
      updateData.birthDate = new Date(data.birthDate);

    const result = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: profileSelect,
    });

    const complete = isProfileComplete(result as MatchingUser);
    if (complete && !result.profileCompletedAt) {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { profileCompletedAt: new Date() },
        select: profileSelect,
      });
      return {
        ...updated,
        profileComplete: true,
      };
    }

    if (!complete && result.profileCompletedAt) {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { profileCompletedAt: null },
        select: profileSelect,
      });
      return {
        ...updated,
        profileComplete: false,
      };
    }

    return {
      ...result,
      profileComplete: complete,
    };
  }

  private static readonly discoverProfileSelect = {
    id: true,
    firstName: true,
    lastName: true,
    bio: true,
    gender: true,
    preference: true,
    profileImageUrl: true,
    birthDate: true,
    createdAt: true,
    _count: {
      select: { receivedLikes: true },
    },
  } as const;

  private static async formatDiscoverUsers(
    users: Array<{
      id: string;
      firstName: string;
      lastName: string | null;
      bio: string | null;
      gender: import("@prisma/client").Gender;
      preference: Preference;
      profileImageUrl: string | null;
      birthDate: Date;
      createdAt: Date;
      _count: { receivedLikes: number };
    }>,
    currentUserId: string | undefined,
  ) {
    let likedSet = new Set<string>();

    if (currentUserId) {
      const myLikes = await prisma.like.findMany({
        where: { fromUserId: currentUserId },
        select: { toUserId: true },
      });
      likedSet = new Set(myLikes.map((like) => like.toUserId));
    }

    return users.map(({ _count, ...profile }) => ({
      ...profile,
      likeCount: _count.receivedLikes,
      isLikedByMe: currentUserId ? likedSet.has(profile.id) : false,
    }));
  }

  static async discover(
    currentUserId: string | undefined,
    limit: number,
    page: number,
  ) {
    const skip = (page - 1) * limit;

    if (!currentUserId) {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          isBlocked: false,
        },
        skip,
        take: limit,
        select: UserService.discoverProfileSelect,
      });
      return UserService.formatDiscoverUsers(users, currentUserId);
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        gender: true,
        preference: true,
      },
    });

    if (!currentUser) {
      throw new Error("Current user not found");
    }

    const genderFilter: Prisma.UserWhereInput[] = [];

    if (currentUser.preference === Preference.EVERYONE) {
      genderFilter.push({});
    } else if (currentUser.preference === Preference.MALE) {
      genderFilter.push({ gender: "MALE" });
    } else if (currentUser.preference === Preference.FEMALE) {
      genderFilter.push({ gender: "FEMALE" });
    }

    const preferenceFilter: Prisma.UserWhereInput[] = [];

    if (currentUser.gender === "MALE") {
      preferenceFilter.push(
        { preference: Preference.MALE },
        { preference: Preference.EVERYONE },
      );
    } else if (currentUser.gender === "FEMALE") {
      preferenceFilter.push(
        { preference: Preference.FEMALE },
        { preference: Preference.EVERYONE },
      );
    } else if (currentUser.gender === "OTHER") {
      preferenceFilter.push({ preference: Preference.EVERYONE });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        deletedAt: null,
        isBlocked: false,
        AND: [{ OR: genderFilter }, { OR: preferenceFilter }],
      },
      skip,
      take: limit,
      select: UserService.discoverProfileSelect,
    });

    return UserService.formatDiscoverUsers(users, currentUserId);
  }

  static async getMatches(userId: string) {
    try {
      const matches = await prisma.match.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        include: {
          user1: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bio: true,
              gender: true,
              profileImageUrl: true,
              birthDate: true,
              isOnline: true,
              createdAt: true,
            },
          },
          user2: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bio: true,
              gender: true,
              profileImageUrl: true,
              birthDate: true,
              isOnline: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedMatches = matches.map((match) => {
        const otherUser = match.user1Id === userId ? match.user2 : match.user1;
        return {
          matchId: match.id,
          matchedAt: match.createdAt,
          user: otherUser,
        };
      });

      return formattedMatches;
    } catch (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
  }

  static async getUserById(userId: string, viewerId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        bio: true,
        birthDate: true,
        gender: true,
        preference: true,
        profileImageUrl: true,
        isOnline: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !viewerId || viewerId === userId) {
      return user;
    }

    const [myLike, theirLike, match] = await Promise.all([
      prisma.like.findUnique({
        where: {
          fromUserId_toUserId: { fromUserId: viewerId, toUserId: userId },
        },
      }),
      prisma.like.findUnique({
        where: {
          fromUserId_toUserId: { fromUserId: userId, toUserId: viewerId },
        },
      }),
      prisma.match.findFirst({
        where: {
          OR: [
            { user1Id: viewerId, user2Id: userId },
            { user1Id: userId, user2Id: viewerId },
          ],
        },
      }),
    ]);

    return {
      ...user,
      isLikedByMe: Boolean(myLike),
      hasLikedMe: Boolean(theirLike),
      isMatched: Boolean(match),
      matchId: match?.id ?? null,
    };
  }
}
