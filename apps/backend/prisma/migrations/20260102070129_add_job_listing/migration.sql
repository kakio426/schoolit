-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "JobListing" (
    "id" SERIAL NOT NULL,
    "schoolProfileId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subjects" TEXT[],
    "regions" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_schoolProfileId_fkey" FOREIGN KEY ("schoolProfileId") REFERENCES "SchoolProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
