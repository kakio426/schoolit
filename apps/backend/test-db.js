
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database');
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        console.log('Query result:', result);
    } catch (e) {
        console.error('Failed to connect to the database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
