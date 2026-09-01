import { z } from "zod";
import {
  Preference,
  SexualOrientation,
  RelationshipStatus,
  Ethnicity,
  Religion,
  EducationLevel,
  BodyType,
  Diet,
  Frequency,
  WantsChildren,
  Pet,
} from "@prisma/client";

const ageFromBirthDate = (birthDate: Date) => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export const updateProfileSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional(),
    bio: z.string().max(500).optional(),
    preference: z.nativeEnum(Preference).optional(),
    profileImageUrl: z.string().optional(),
    sexualOrientation: z.nativeEnum(SexualOrientation).optional(),
    relationshipStatus: z.nativeEnum(RelationshipStatus).optional(),
    ethnicity: z.nativeEnum(Ethnicity).optional(),
    religion: z.nativeEnum(Religion).optional(),
    educationLevel: z.nativeEnum(EducationLevel).optional(),
    bodyType: z.nativeEnum(BodyType).optional(),
    hasChildren: z.boolean().optional(),
    wantsChildren: z.nativeEnum(WantsChildren).optional(),
    diet: z.nativeEnum(Diet).optional(),
    drinking: z.nativeEnum(Frequency).optional(),
    smoking: z.nativeEnum(Frequency).optional(),
    drugs: z.nativeEnum(Frequency).optional(),
    pets: z.array(z.nativeEnum(Pet)).optional(),
    language: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    prefMinAge: z.number().int().min(18).max(120).optional(),
    prefMaxAge: z.number().int().min(18).max(120).optional(),
    prefEthnicity: z.nativeEnum(Ethnicity).optional().nullable(),
    prefReligion: z.nativeEnum(Religion).optional().nullable(),
    prefEducationLevel: z.nativeEnum(EducationLevel).optional().nullable(),
    prefLanguage: z.string().min(1).optional().nullable(),
    prefMaxDistanceKm: z.number().int().min(1).max(500).optional(),
    birthDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.prefMinAge !== undefined && data.prefMaxAge !== undefined) {
        return data.prefMinAge <= data.prefMaxAge;
      }
      return true;
    },
    { message: "prefMinAge must be less than or equal to prefMaxAge" },
  )
  .refine(
    (data) => {
      if (data.birthDate) {
        const birth = new Date(data.birthDate);
        return ageFromBirthDate(birth) >= 18;
      }
      return true;
    },
    { message: "You must be at least 18 years old" },
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
