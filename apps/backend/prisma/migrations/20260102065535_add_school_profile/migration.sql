-- CreateTable
CREATE TABLE "SchoolProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "schoolName" TEXT,
    "address" TEXT,
    "website" TEXT,
    "description" TEXT,
    "logoImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolProfile_userId_key" ON "SchoolProfile"("userId");

-- AddForeignKey
ALTER TABLE "SchoolProfile" ADD CONSTRAINT "SchoolProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
