import {
  Gender,
  Preference,
  SexualOrientation,
  Religion,
  EducationLevel,
  Diet,
  Frequency,
  WantsChildren,
  Pet,
} from "@prisma/client";

export interface MatchingUser {
  id: string;
  firstName: string;
  lastName: string | null;
  birthDate: Date;
  gender: Gender;
  preference: Preference;
  sexualOrientation: SexualOrientation | null;
  relationshipStatus: string | null;
  ethnicity: string | null;
  religion: Religion | null;
  educationLevel: EducationLevel | null;
  bodyType: string | null;
  hasChildren: boolean | null;
  wantsChildren: WantsChildren | null;
  diet: Diet | null;
  drinking: Frequency | null;
  smoking: Frequency | null;
  drugs: Frequency | null;
  pets: Pet[];
  language: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  prefMinAge: number | null;
  prefMaxAge: number | null;
  prefEthnicity: string | null;
  prefReligion: Religion | null;
  prefEducationLevel: EducationLevel | null;
  prefLanguage: string | null;
  prefMaxDistanceKm: number | null;
  profileImageUrl: string | null;
  profileCompletedAt: Date | null;
}

export interface SharedAttribute {
  label: string;
  value: string;
  icon: string;
}

export function computeAge(birthDate: Date): number {
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
}

export function isProfileComplete(user: MatchingUser): boolean {
  return !!(
    user.gender &&
    user.sexualOrientation &&
    user.birthDate &&
    computeAge(user.birthDate) >= 18 &&
    user.relationshipStatus &&
    user.ethnicity &&
    user.religion &&
    user.educationLevel &&
    user.language &&
    user.city &&
    user.latitude != null &&
    user.longitude != null &&
    user.prefMinAge != null &&
    user.prefMaxAge != null &&
    user.prefMaxDistanceKm != null &&
    user.preference
  );
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function genderMatchesPreference(
  gender: Gender,
  preference: Preference,
): boolean {
  if (preference === Preference.EVERYONE) return true;
  if (preference === Preference.MALE) return gender === Gender.MALE;
  if (preference === Preference.FEMALE) return gender === Gender.FEMALE;
  return false;
}

function isAttractedTo(
  userGender: Gender,
  userOrientation: SexualOrientation,
  targetGender: Gender,
): boolean {
  if (userOrientation === SexualOrientation.BISEXUAL) return true;
  if (userOrientation === SexualOrientation.STRAIGHT) {
    if (userGender === Gender.MALE) return targetGender === Gender.FEMALE;
    if (userGender === Gender.FEMALE) return targetGender === Gender.MALE;
    return true;
  }
  if (userOrientation === SexualOrientation.GAY) {
    if (userGender === Gender.MALE) return targetGender === Gender.MALE;
    if (userGender === Gender.FEMALE) return targetGender === Gender.FEMALE;
    return true;
  }
  return false;
}

export function isOrientationCompatible(
  userA: MatchingUser,
  userB: MatchingUser,
): boolean {
  if (!userA.sexualOrientation || !userB.sexualOrientation) return false;

  const aLikesB =
    genderMatchesPreference(userB.gender, userA.preference) &&
    isAttractedTo(userA.gender, userA.sexualOrientation, userB.gender);
  const bLikesA =
    genderMatchesPreference(userA.gender, userB.preference) &&
    isAttractedTo(userB.gender, userB.sexualOrientation, userA.gender);

  return aLikesB && bLikesA;
}

export function isAgeCompatible(
  userA: MatchingUser,
  userB: MatchingUser,
): boolean {
  const ageA = computeAge(userA.birthDate);
  const ageB = computeAge(userB.birthDate);

  const aInRange =
    userA.prefMinAge != null &&
    userA.prefMaxAge != null &&
    ageB >= userA.prefMinAge &&
    ageB <= userA.prefMaxAge;
  const bInRange =
    userB.prefMinAge != null &&
    userB.prefMaxAge != null &&
    ageA >= userB.prefMinAge &&
    ageA <= userB.prefMaxAge;

  return aInRange && bInRange;
}

function religionScore(a: Religion | null, b: Religion | null): number {
  if (!a || !b) return 0;
  if (a === b) return 100;
  const isFlexible = (r: Religion) =>
    r === Religion.AGNOSTIC || r === Religion.PREFER_NOT_TO_SAY;
  if (isFlexible(a) || isFlexible(b)) return 50;
  return 0;
}

function ethnicityScore(
  aEthnicity: string | null,
  bEthnicity: string | null,
  aPref: string | null,
  bPref: string | null,
): number {
  if (!aEthnicity || !bEthnicity) return 0;
  if (aEthnicity === bEthnicity) return 100;
  if (!aPref || !bPref) return 50;
  if (aPref === bEthnicity || bPref === aEthnicity) return 75;
  return 25;
}

function educationScore(
  a: EducationLevel | null,
  b: EducationLevel | null,
): number {
  if (!a || !b) return 0;
  const levels = [
    EducationLevel.HIGH_SCHOOL,
    EducationLevel.SOME_COLLEGE,
    EducationLevel.UNDERGRADUATE,
    EducationLevel.POSTGRADUATE,
  ];
  const diff = Math.abs(levels.indexOf(a) - levels.indexOf(b));
  return Math.max(0, 100 - diff * 25);
}

function frequencyScore(a: Frequency | null, b: Frequency | null): number {
  if (!a || !b) return 50;
  const levels = [
    Frequency.NEVER,
    Frequency.RARELY,
    Frequency.SOMETIMES,
    Frequency.REGULARLY,
  ];
  const diff = Math.abs(levels.indexOf(a) - levels.indexOf(b));
  return Math.max(0, 100 - diff * 33);
}

function dietScore(a: Diet | null, b: Diet | null): number {
  if (!a || !b) return 50;
  if (a === b) return 100;
  if (a === Diet.ANYTHING || b === Diet.ANYTHING) return 75;
  return 25;
}

function petsScore(a: Pet[], b: Pet[]): number {
  if (!a.length || !b.length) return 50;
  const setA = new Set(a);
  const overlap = b.filter((p) => setA.has(p));
  if (overlap.length > 0) return 100;
  if (a.includes(Pet.NONE) && b.includes(Pet.NONE)) return 100;
  return 30;
}

function childrenScore(
  aHas: boolean | null,
  aWants: WantsChildren | null,
  bHas: boolean | null,
  bWants: WantsChildren | null,
): number {
  if (aWants == null || bWants == null) return 50;
  if (aWants === bWants) return 100;
  if (aWants === WantsChildren.OPEN || bWants === WantsChildren.OPEN)
    return 70;
  if (aHas === bHas) return 60;
  return 20;
}

function lifestyleScore(userA: MatchingUser, userB: MatchingUser): number {
  const scores = [
    dietScore(userA.diet, userB.diet),
    frequencyScore(userA.drinking, userB.drinking),
    frequencyScore(userA.smoking, userB.smoking),
    frequencyScore(userA.drugs, userB.drugs),
    petsScore(userA.pets, userB.pets),
    childrenScore(
      userA.hasChildren,
      userA.wantsChildren,
      userB.hasChildren,
      userB.wantsChildren,
    ),
  ];
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

function languageScore(a: string | null, b: string | null): number {
  if (!a || !b) return 0;
  return a.toLowerCase() === b.toLowerCase() ? 100 : 0;
}

function distanceScore(
  userA: MatchingUser,
  userB: MatchingUser,
  distanceKm: number,
): number {
  const maxKm = userA.prefMaxDistanceKm ?? 50;
  if (distanceKm <= maxKm) {
    return Math.max(0, 100 - (distanceKm / maxKm) * 100);
  }
  return Math.max(0, 50 - ((distanceKm - maxKm) / maxKm) * 50);
}

export function calculateCompatibilityScore(
  userA: MatchingUser,
  userB: MatchingUser,
): number {
  const distanceKm =
    userA.latitude != null &&
    userA.longitude != null &&
    userB.latitude != null &&
    userB.longitude != null
      ? haversineDistanceKm(
          userA.latitude,
          userA.longitude,
          userB.latitude,
          userB.longitude,
        )
      : 9999;

  const religion = religionScore(userA.religion, userB.religion);
  const ethnicity = ethnicityScore(
    userA.ethnicity,
    userB.ethnicity,
    userA.prefEthnicity,
    userB.prefEthnicity,
  );
  const education = educationScore(
    userA.educationLevel,
    userB.educationLevel,
  );
  const lifestyle = lifestyleScore(userA, userB);
  const language = languageScore(userA.language, userB.language);
  const distance = distanceScore(userA, userB, distanceKm);

  const weighted =
    religion * 0.2 +
    ethnicity * 0.1 +
    education * 0.1 +
    lifestyle * 0.25 +
    language * 0.1 +
    distance * 0.25;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}

export function getDistanceKm(
  userA: MatchingUser,
  userB: MatchingUser,
): number {
  if (
    userA.latitude == null ||
    userA.longitude == null ||
    userB.latitude == null ||
    userB.longitude == null
  ) {
    return 0;
  }
  return Math.round(
    haversineDistanceKm(
      userA.latitude,
      userA.longitude,
      userB.latitude,
      userB.longitude,
    ) * 10,
  ) / 10;
}

function formatEnum(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function getSharedAttributes(
  userA: MatchingUser,
  userB: MatchingUser,
): SharedAttribute[] {
  const attrs: SharedAttribute[] = [];

  if (userA.religion && userB.religion && userA.religion === userB.religion) {
    attrs.push({
      label: "Religion",
      value: formatEnum(userA.religion),
      icon: "church",
    });
  }
  if (
    userA.educationLevel &&
    userB.educationLevel &&
    userA.educationLevel === userB.educationLevel
  ) {
    attrs.push({
      label: "Education",
      value: formatEnum(userA.educationLevel),
      icon: "graduation-cap",
    });
  }
  if (userA.bodyType && userB.bodyType && userA.bodyType === userB.bodyType) {
    attrs.push({
      label: "Body type",
      value: formatEnum(userA.bodyType),
      icon: "user",
    });
  }
  if (userA.diet && userB.diet && userA.diet === userB.diet) {
    attrs.push({
      label: "Diet",
      value: formatEnum(userA.diet),
      icon: "utensils",
    });
  }
  if (userA.drinking && userB.drinking && userA.drinking === userB.drinking) {
    attrs.push({
      label: "Drinking",
      value: formatEnum(userA.drinking),
      icon: "wine",
    });
  }
  if (userA.smoking && userB.smoking && userA.smoking === userB.smoking) {
    attrs.push({
      label: "Smoking",
      value: formatEnum(userA.smoking),
      icon: "cigarette",
    });
  }
  if (userA.drugs && userB.drugs && userA.drugs === userB.drugs) {
    attrs.push({
      label: "Drugs",
      value: formatEnum(userA.drugs),
      icon: "pill",
    });
  }
  const sharedPets = userA.pets.filter((p) => userB.pets.includes(p));
  if (sharedPets.length > 0) {
    attrs.push({
      label: "Pets",
      value: sharedPets.map(formatEnum).join(", "),
      icon: "paw-print",
    });
  }
  if (
    userA.language &&
    userB.language &&
    userA.language.toLowerCase() === userB.language.toLowerCase()
  ) {
    attrs.push({
      label: "Language",
      value: userA.language,
      icon: "languages",
    });
  }

  return attrs;
}
