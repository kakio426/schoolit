import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    const user = await prisma.user.update({
        where: { email: 'kakio@naver.com' },
        data: {
            verificationCode: '111111|kakio@naver.com',
            verificationExpires: expires
        }
    });
    console.log('Force updated code to 111111 for kakio@naver.com');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
