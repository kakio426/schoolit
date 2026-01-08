import { PrismaClient } from '@prisma/client';

async function seedBoards() {
    const prisma = new PrismaClient();
    try {
        const boards = [
            { title: '공지사항', description: '에듀핀의 새로운 소식을 전해드립니다.', category: 'NOTICE' },
            { title: '자유게시판', description: '자유롭게 정보를 공유하고 이야기 나누는 공간입니다.', category: 'FREE' },
            { title: '질문과 답변', description: '궁금한 점을 묻고 전문가의 답변을 받아보세요.', category: 'QNA' },
            { title: '업체 후기', description: '생생한 업체 이용 후기를 공유합니다.', category: 'REVIEW_BOARD' },
        ];

        for (const board of boards) {
            await prisma.board.upsert({
                where: { category: board.category },
                update: {},
                create: board,
            });
        }
        console.log('Boards seeded successfully!');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

seedBoards();
