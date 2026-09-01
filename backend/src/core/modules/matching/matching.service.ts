import { prisma } from "../../../config/prisma";
import { AppError } from "../../errors/AppError";
import {
  MatchingUser,
  calculateCompatibilityScore,
  computeAge,
  getDistanceKm,
  getSharedAttributes,
  isAgeCompatible,
  isOrientationCompatible,
  isProfileComplete,
} from "./matching.utils";

const matchingUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  birthDate: true,
  gender: true,
  preference: true,
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
  profileImageUrl: true,
  profileCompletedAt: true,
} as const;

export class MatchingService {
  private static async getExcludedUserIds(
    userId: string,
    options?: { excludeLikes?: boolean; excludeMatches?: boolean },
  ): Promise<Set<string>> {
    const excludeLikes = options?.excludeLikes ?? true;
    const excludeMatches = options?.excludeMatches ?? true;

    const [likes, skips, matches] = await Promise.all([
      excludeLikes
        ? prisma.like.findMany({
            where: { fromUserId: userId },
            select: { toUserId: true },
          })
        : Promise.resolve([]),
      prisma.skip.findMany({
        where: { fromUserId: userId },
        select: { toUserId: true },
      }),
      excludeMatches
        ? prisma.match.findMany({
            where: {
              OR: [{ user1Id: userId }, { user2Id: userId }],
            },
            select: { user1Id: true, user2Id: true },
          })
        : Promise.resolve([]),
    ]);

    const excluded = new Set<string>();
    likes.forEach((l) => excluded.add(l.toUserId));
    skips.forEach((s) => excluded.add(s.toUserId));
    matches.forEach((m) => {
      excluded.add(m.user1Id === userId ? m.user2Id : m.user1Id);
    });
    return excluded;
  }

  private static formatSuggestion(
    currentUser: MatchingUser,
    candidate: MatchingUser,
    score: number,
  ) {
    return {
      userId: candidate.id,
      name: `${candidate.firstName}${candidate.lastName ? ` ${candidate.lastName}` : ""}`,
      age: computeAge(candidate.birthDate),
      photoUrl: candidate.profileImageUrl,
      score,
      sharedAttributes: getSharedAttributes(currentUser, candidate),
      distanceKm: getDistanceKm(currentUser, candidate),
      city: candidate.city,
    };
  }

  private static async getRankedCandidates(
    userId: string,
    limit: number,
    offset: number,
    excludedIds?: Set<string>,
  ) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: matchingUserSelect,
    });

    if (!currentUser) {
      throw new AppError("User not found", 404);
    }

    if (!isProfileComplete(currentUser as MatchingUser)) {
      throw new AppError("Profile incomplete", 400);
    }

    const excluded =
      excludedIds ?? (await MatchingService.getExcludedUserIds(userId));

    const candidates = await prisma.user.findMany({
      where: {
        id: { not: userId },
        deletedAt: null,
        isBlocked: false,
        profileCompletedAt: { not: null },
      },
      select: matchingUserSelect,
    });

    const current = currentUser as MatchingUser;

    const scored = candidates
      .filter((c) => !excluded.has(c.id))
      .filter((c) => isProfileComplete(c as MatchingUser))
      .filter((c) => isOrientationCompatible(current, c as MatchingUser))
      .filter((c) => isAgeCompatible(current, c as MatchingUser))
      .map((c) => ({
        candidate: c as MatchingUser,
        score: calculateCompatibilityScore(current, c as MatchingUser),
      }))
      .sort((a, b) => b.score - a.score);

    const paginated = scored.slice(offset, offset + limit);

    return paginated.map(({ candidate, score }) =>
      MatchingService.formatSuggestion(current, candidate, score),
    );
  }

  static async getSuggestions(
    userId: string,
    limit: number,
    offset: number,
  ) {
    return MatchingService.getRankedCandidates(userId, limit, offset);
  }

  static async getTopMatches(userId: string, limit: number) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: matchingUserSelect,
    });

    if (!currentUser) {
      throw new AppError("User not found", 404);
    }

    if (!isProfileComplete(currentUser as MatchingUser)) {
      throw new AppError("Profile incomplete", 400);
    }

    const current = currentUser as MatchingUser;

    const dbMatches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: matchingUserSelect },
        user2: { select: matchingUserSelect },
      },
      orderBy: { createdAt: "desc" },
    });

    const mutualMatches = dbMatches
      .map((match) => {
        const candidate = (
          match.user1Id === userId ? match.user2 : match.user1
        ) as MatchingUser;
        const score = calculateCompatibilityScore(current, candidate);
        return {
          ...MatchingService.formatSuggestion(current, candidate, score),
          isMutualMatch: true,
        };
      })
      .sort((a, b) => b.score - a.score);

    if (mutualMatches.length >= limit) {
      return mutualMatches.slice(0, limit);
    }

    const alreadyIncluded = new Set(mutualMatches.map((m) => m.userId));
    alreadyIncluded.add(userId);

    const suggestionExcluded = await MatchingService.getExcludedUserIds(userId);
    alreadyIncluded.forEach((id) => suggestionExcluded.add(id));

    const remaining = limit - mutualMatches.length;
    const suggestions = await MatchingService.getRankedCandidates(
      userId,
      remaining,
      0,
      suggestionExcluded,
    );

    return [...mutualMatches, ...suggestions];
  }
}
