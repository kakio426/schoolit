const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@schoolit.com';
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingAdmin) {
        console.log('ℹ️ Admin already exists, skipping seed.');
        return;
    }

    const hashedPassword = await bcrypt.hash('admin1234!', 10);

    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            name: '마스터 관리자',
            role: 'ADMIN',
            provider: 'LOCAL',
        },
    });

    console.log('✅ Master Admin created:', admin.email);

    // Sample Accounts for Testing Roles
    const roles = [
        { email: 'school@test.com', name: '꿈나무 초등학교', role: 'SCHOOL' },
        { email: 'teacher@test.com', name: '김코딩 강사', role: 'TEACHER' },
        { email: 'business@test.com', name: '(주)에듀테크', role: 'BUSINESS' },
    ];

    for (const r of roles) {
        const user = await prisma.user.upsert({
            where: { email: r.email },
            update: {},
            create: {
                email: r.email,
                password: hashedPassword,
                name: r.name,
                role: r.role,
                provider: 'LOCAL',
            },
        });
        console.log(`✅ ${r.role} account created:`, user.email);
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
