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
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
