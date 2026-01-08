
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'kakio@naver.com' },
    });

    if (user) {
        console.log('현재 계정 정보:', { id: user.id, email: user.email, role: user.role });

        if (user.role !== 'TEACHER') {
            console.log('역할이 TEACHER가 아닙니다. 수정을 시도합니다...');
            const updated = await prisma.user.update({
                where: { id: user.id },
                data: { role: 'TEACHER' },
            });
            console.log('수정 완료:', { id: updated.id, email: updated.email, role: updated.role });
        } else {
            console.log('이미 TEACHER 역할입니다. 프론트엔드 캐시나 로직 문제일 수 있습니다.');
        }
    } else {
        console.log('유저를 찾을 수 없습니다.');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
