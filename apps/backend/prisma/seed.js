const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const commonPassword = await bcrypt.hash('test1234!', 10);
    const adminPassword = await bcrypt.hash('admin1234!', 10);

    // 1. 마스터 관리자
    await prisma.user.upsert({
        where: { email: 'admin@schoolit.com' },
        update: {},
        create: {
            email: 'admin@schoolit.com',
            password: adminPassword,
            name: '마스터 관리자',
            role: 'ADMIN',
            provider: 'LOCAL',
        },
    });

    // 2. 역할별 테스트 계정 (항상 존재 확인 및 생성)
    const users = [
        { email: 'school@test.com', name: '꿈나무 초등학교', role: 'SCHOOL' },
        { email: 'teacher@test.com', name: '김코딩 강사', role: 'TEACHER' },
        { email: 'business@test.com', name: '(주)에듀테크', role: 'BUSINESS' },
    ];

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: { role: u.role }, // 이미 있다면 역할이라도 최신화
            create: {
                email: u.email,
                password: commonPassword,
                name: u.name,
                role: u.role,
                provider: 'LOCAL',
            },
        });
        console.log(`✅ User ensured: ${u.email} (${u.role})`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
