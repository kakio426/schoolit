/*
  Warnings:

  - You are about to drop the `certifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certifications" DROP CONSTRAINT "certifications_teacher_profile_id_fkey";

-- DropTable
DROP TABLE "certifications";

-- CreateTable
CREATE TABLE "teacher_licenses" (
    "id" SERIAL NOT NULL,
    "teacher_profile_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_licenses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "teacher_licenses" ADD CONSTRAINT "teacher_licenses_teacher_profile_id_fkey" FOREIGN KEY ("teacher_profile_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
