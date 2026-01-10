-- CreateEnum
CREATE TYPE "TrustTier" AS ENUM ('NEW', 'VERIFIED', 'TRUSTED', 'TOP_RATED');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FAST_RESPONDER', 'PROFILE_MASTER', 'VETERAN', 'HIGH_RETURN', 'GOOD_PAYER', 'S2B_CERTIFIED');

-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "attachment_url" TEXT,
ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "cost" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reputation_score" INTEGER NOT NULL DEFAULT 365,
ADD COLUMN     "trust_tier" "TrustTier" NOT NULL DEFAULT 'NEW';

-- CreateTable
CREATE TABLE "user_badges" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "BadgeType" NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_user_id_type_key" ON "user_badges"("user_id", "type");

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
