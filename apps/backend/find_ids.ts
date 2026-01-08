import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const schools = await prisma.schoolProfile.findMany({
            take: 1,
            include: { user: true }
        });
        const applications = await prisma.jobApplication.findMany({
            where: { status: 'HIRED' },
            take: 1,
            include: {
                user: true,
                jobListing: { include: { schoolProfile: true } }
            }
        });

        console.log(JSON.stringify({
            school: schools[0],
            application: applications[0]
        }, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
