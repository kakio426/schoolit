-- AlterTable
ALTER TABLE "job_listings" ADD COLUMN     "teacher_profile_id" INTEGER,
ALTER COLUMN "school_profile_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_teacher_profile_id_fkey" FOREIGN KEY ("teacher_profile_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
