-- AlterTable
ALTER TABLE "school_profiles" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verification_code" TEXT,
ADD COLUMN     "verification_expires" TIMESTAMP(3);
