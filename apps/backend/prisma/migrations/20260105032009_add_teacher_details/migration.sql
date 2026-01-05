-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('TEACHER_HIRING', 'EVENT_VENDOR');

-- AlterTable
ALTER TABLE "job_listings" ADD COLUMN     "budget" INTEGER DEFAULT 0,
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "contract_period" TEXT,
ADD COLUMN     "equipment_provided" BOOLEAN DEFAULT false,
ADD COLUMN     "event_duration" TEXT,
ADD COLUMN     "event_type" TEXT,
ADD COLUMN     "grade_level" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "job_type" "JobType" NOT NULL DEFAULT 'TEACHER_HIRING',
ADD COLUMN     "participant_count" TEXT,
ADD COLUMN     "teaching_hours" INTEGER;

-- AlterTable
ALTER TABLE "school_profiles" ADD COLUMN     "detail_address" TEXT,
ADD COLUMN     "homepage" TEXT,
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "school_type" TEXT DEFAULT 'ELEMENTARY',
ADD COLUMN     "student_count" INTEGER,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN     "target_grades" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_banned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "teacher_experiences" (
    "id" SERIAL NOT NULL,
    "teacher_profile_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_educations" (
    "id" SERIAL NOT NULL,
    "teacher_profile_id" INTEGER NOT NULL,
    "school_name" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "major" TEXT,
    "graduation_status" TEXT NOT NULL DEFAULT 'GRADUATED',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_links" (
    "id" SERIAL NOT NULL,
    "teacher_profile_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_links_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "teacher_experiences" ADD CONSTRAINT "teacher_experiences_teacher_profile_id_fkey" FOREIGN KEY ("teacher_profile_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_educations" ADD CONSTRAINT "teacher_educations_teacher_profile_id_fkey" FOREIGN KEY ("teacher_profile_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_links" ADD CONSTRAINT "teacher_links_teacher_profile_id_fkey" FOREIGN KEY ("teacher_profile_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
