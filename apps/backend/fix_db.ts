import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Adding columns to job_applications...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "cost" INTEGER;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "contact_email" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "contact_phone" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "attachment_url" TEXT;`);
        console.log('Columns added successfully.');
    } catch (e) {
        console.error('Failed to add columns', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
