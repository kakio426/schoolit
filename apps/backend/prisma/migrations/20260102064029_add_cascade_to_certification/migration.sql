-- DropForeignKey
ALTER TABLE "Certification" DROP CONSTRAINT "Certification_teacherProfileId_fkey";

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
