// @ts-nocheck
import { PrismaClient, Role, Provider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@schoolit.com';
    const hashedPassword = await bcrypt.hash('admin1234!', 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: '마스터 관리자',
            role: Role.ADMIN,
            provider: Provider.LOCAL,
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
