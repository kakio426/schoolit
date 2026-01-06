import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'kakio@naver.com' },
        select: { id: true, email: true, verificationCode: true, verificationExpires: true }
    });
    if (user) {
        console.log('--- USER INFO ---');
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Code: ${user.verificationCode}`);
        console.log(`Expires: ${user.verificationExpires}`);
        console.log(`Current Time: ${new Date()}`);
        console.log('------------------');
    } else {
        console.log('No user found.');
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
