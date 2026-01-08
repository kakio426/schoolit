-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN     "is_searchable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teacher_type" TEXT;
