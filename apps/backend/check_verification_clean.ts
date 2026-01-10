
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'kakio@naver.com' },
            select: {
                id: true,
                email: true,
                role: true,
                schoolProfile: {
                    select: {
                        id: true,
                        schoolName: true,
                        isVerified: true
                    }
                }
            }
        });
        console.log('--- USER STATUS CHECK ---');
        console.log(`Email: ${user?.email}`);
        console.log(`Role: ${user?.role}`);
        console.log(`School Verified: ${user?.schoolProfile?.isVerified}`);
        console.log('-------------------------');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
