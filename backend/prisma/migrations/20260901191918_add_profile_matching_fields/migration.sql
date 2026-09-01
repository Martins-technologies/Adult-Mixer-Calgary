-- CreateEnum
CREATE TYPE "SexualOrientation" AS ENUM ('STRAIGHT', 'GAY', 'BISEXUAL');

-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('SINGLE', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "Ethnicity" AS ENUM ('WHITE', 'BLACK', 'ASIAN', 'SOUTH_ASIAN', 'HISPANIC', 'MIDDLE_EASTERN', 'MIXED', 'OTHER');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('CHRISTIANITY', 'ISLAM', 'HINDUISM', 'JUDAISM', 'BUDDHISM', 'ATHEIST', 'AGNOSTIC', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('HIGH_SCHOOL', 'SOME_COLLEGE', 'UNDERGRADUATE', 'POSTGRADUATE');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('SLIM', 'ATHLETIC', 'AVERAGE', 'CURVY', 'PLUS_SIZE');

-- CreateEnum
CREATE TYPE "Diet" AS ENUM ('ANYTHING', 'VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER', 'OTHER');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('NEVER', 'RARELY', 'SOMETIMES', 'REGULARLY');

-- CreateEnum
CREATE TYPE "WantsChildren" AS ENUM ('WANTS', 'DOESNT_WANT', 'OPEN');

-- CreateEnum
CREATE TYPE "Pet" AS ENUM ('HAS_CATS', 'HAS_DOGS', 'OTHER', 'NONE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bodyType" "BodyType",
ADD COLUMN     "city" TEXT DEFAULT 'Calgary',
ADD COLUMN     "diet" "Diet",
ADD COLUMN     "drinking" "Frequency",
ADD COLUMN     "drugs" "Frequency",
ADD COLUMN     "educationLevel" "EducationLevel",
ADD COLUMN     "ethnicity" "Ethnicity",
ADD COLUMN     "hasChildren" BOOLEAN,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "pets" "Pet"[],
ADD COLUMN     "prefEducationLevel" "EducationLevel",
ADD COLUMN     "prefEthnicity" "Ethnicity",
ADD COLUMN     "prefLanguage" TEXT,
ADD COLUMN     "prefMaxAge" INTEGER,
ADD COLUMN     "prefMaxDistanceKm" INTEGER DEFAULT 50,
ADD COLUMN     "prefMinAge" INTEGER,
ADD COLUMN     "prefReligion" "Religion",
ADD COLUMN     "profileCompletedAt" TIMESTAMP(3),
ADD COLUMN     "relationshipStatus" "RelationshipStatus",
ADD COLUMN     "religion" "Religion",
ADD COLUMN     "sexualOrientation" "SexualOrientation",
ADD COLUMN     "smoking" "Frequency",
ADD COLUMN     "wantsChildren" "WantsChildren";

-- CreateTable
CREATE TABLE "Skip" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Skip_toUserId_idx" ON "Skip"("toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Skip_fromUserId_toUserId_key" ON "Skip"("fromUserId", "toUserId");

-- CreateIndex
CREATE INDEX "User_city_idx" ON "User"("city");

-- AddForeignKey
ALTER TABLE "Skip" ADD CONSTRAINT "Skip_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skip" ADD CONSTRAINT "Skip_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
