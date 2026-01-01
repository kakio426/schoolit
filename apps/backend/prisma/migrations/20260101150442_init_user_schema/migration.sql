-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SCHOOL', 'TEACHER', 'BUSINESS');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('LOCAL', 'KAKAO', 'NAVER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "role" "Role" NOT NULL,
    "provider" "Provider" NOT NULL DEFAULT 'LOCAL',
    "snsId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_snsId_key" ON "User"("provider", "snsId");
