/*
  Warnings:

  - The values [ACCEPTED,COMPLETED] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('PENDING', 'DOCUMENT_SCREENING', 'INTERVIEWING', 'VERIFICATION', 'HIRED', 'REJECTED', 'BIDDING', 'CONTRACTING', 'EXECUTING', 'PAYMENT_COMPLETED');
ALTER TABLE "job_applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "job_applications" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "ApplicationStatus_old";
ALTER TABLE "job_applications" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "business_profiles" ADD COLUMN     "bank_account" TEXT;

-- AlterTable
ALTER TABLE "job_listings" ADD COLUMN     "internal_checklist" JSONB;

-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN     "bank_account" TEXT;
