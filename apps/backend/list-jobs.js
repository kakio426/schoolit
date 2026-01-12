const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const jobs = await prisma.jobListing.findMany({
        select: {
            id: true,
            title: true,
            status: true,
            active: true,
            workflowStatus: true,
            createdAt: true,
            schoolProfile: {
                select: { schoolName: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 20
    });
    console.log(JSON.stringify(jobs, null, 2));
    const count = await prisma.jobListing.count();
    console.log('Total job count:', count);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
