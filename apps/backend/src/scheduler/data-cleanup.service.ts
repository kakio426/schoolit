import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';

/**
 * Data Cleanup Scheduler
 *
 * 개인정보보호법 준수를 위해 탈퇴 후 6개월 경과한 유저 데이터를 완전 삭제합니다.
 */
@Injectable()
export class DataCleanupService {
    private readonly logger = new Logger(DataCleanupService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * 매주 일요일 자정에 실행 (6개월 이상 경과 유저 삭제)
     */
    @Cron(CronExpression.EVERY_WEEK)
    async cleanupDeletedUsers() {
        this.logger.log('Starting cleanup of deleted users...');

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        try {
            // 1. 삭제 대상 유저 조회
            const usersToDelete = await this.prisma.user.findMany({
                where: {
                    isDeleted: true,
                    deletedAt: { lt: sixMonthsAgo },
                },
                select: {
                    id: true,
                    email: true,
                    deletedAt: true,
                },
            });

            if (usersToDelete.length === 0) {
                this.logger.log('No users to cleanup.');
                return { deleted: 0 };
            }

            this.logger.log(`Found ${usersToDelete.length} users to cleanup.`);

            // 2. 관련 데이터 삭제 (순서 중요 - Foreign Key 의존성)
            for (const user of usersToDelete) {
                await this.deleteUserData(user.id);
            }

            // 3. 유저 레코드 삭제
            const deleted = await this.prisma.user.deleteMany({
                where: {
                    isDeleted: true,
                    deletedAt: { lt: sixMonthsAgo },
                },
            });

            this.logger.log(`Cleanup complete. Deleted ${deleted.count} users.`);
            return { deleted: deleted.count };
        } catch (error) {
            this.logger.error(`Cleanup failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 특정 유저의 관련 데이터 삭제
     */
    private async deleteUserData(userId: number) {
        this.logger.log(`Deleting data for user ${userId}...`);

        // 1. 알림 삭제
        await this.prisma.notification.deleteMany({ where: { userId } });

        // 2. 채팅 메시지 삭제 (유저가 보낸 메시지)
        await this.prisma.chatMessage.deleteMany({ where: { senderId: userId } });

        // 3. 게시글 좋아요 삭제
        await this.prisma.postLike.deleteMany({ where: { userId } });

        // 4. 댓글 삭제
        await this.prisma.comment.deleteMany({ where: { authorId: userId } });

        // 5. 게시글 삭제
        await this.prisma.post.deleteMany({ where: { authorId: userId } });

        // 6. 피드백 삭제
        await this.prisma.feedback.deleteMany({ where: { userId } });

        // 7. 프로필 관련 데이터 삭제
        const teacherProfile = await this.prisma.teacherProfile.findUnique({
            where: { userId },
        });
        if (teacherProfile) {
            await this.prisma.teacherExperience.deleteMany({
                where: { teacherProfileId: teacherProfile.id },
            });
            await this.prisma.teacherEducation.deleteMany({
                where: { teacherProfileId: teacherProfile.id },
            });
            await this.prisma.teacherLink.deleteMany({
                where: { teacherProfileId: teacherProfile.id },
            });
            await this.prisma.teacherLicense.deleteMany({
                where: { teacherProfileId: teacherProfile.id },
            });
            await this.prisma.teacherProfile.delete({
                where: { userId },
            });
        }

        // 8. 학교 프로필 삭제
        await this.prisma.schoolProfile.deleteMany({ where: { userId } });

        // 9. 사업자 프로필 삭제
        const businessProfile = await this.prisma.businessProfile.findUnique({
            where: { userId },
        });
        if (businessProfile) {
            await this.prisma.businessPortfolio.deleteMany({
                where: { businessProfileId: businessProfile.id },
            });
            await this.prisma.businessProfile.delete({
                where: { userId },
            });
        }

        this.logger.log(`Data deleted for user ${userId}.`);
    }

    /**
     * 수동 정리 실행 (관리자용)
     */
    async manualCleanup() {
        return this.cleanupDeletedUsers();
    }

    /**
     * 정리 대상 유저 목록 조회 (미리보기)
     */
    async getCleanupTargets() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        return this.prisma.user.findMany({
            where: {
                isDeleted: true,
                deletedAt: { lt: sixMonthsAgo },
            },
            select: {
                id: true,
                email: true,
                deletedAt: true,
            },
        });
    }
}
