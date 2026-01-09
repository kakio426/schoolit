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

  // ============================================
  // 2025 COMPLIANCE: 채용 서류 7일 파기 (PIPA)
  // ============================================

  /**
   * 매일 새벽 3시에 실행 - 탈락자 서류 7일 후 자동 파기
   * 2025 경기도교육청 지침: "채용 확정 후 14일 반환청구 + 7일 후 파기"
   */
  @Cron('0 3 * * *') // 매일 오전 3시
  async cleanupRecruitmentDocuments() {
    this.logger.log('[COMPLIANCE] Starting recruitment document cleanup...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      // 1. 탈락(REJECTED) 상태이고 7일 이상 경과한 지원서 조회
      const applicationsToClean = await this.prisma.jobApplication.findMany({
        where: {
          status: 'REJECTED',
          updatedAt: { lt: sevenDaysAgo },
        },
        include: {
          user: {
            include: {
              teacherProfile: true,
            },
          },
        },
      });

      if (applicationsToClean.length === 0) {
        this.logger.log('[COMPLIANCE] No recruitment documents to cleanup.');
        return { cleaned: 0 };
      }

      this.logger.log(`[COMPLIANCE] Found ${applicationsToClean.length} applications to clean.`);

      let cleanedCount = 0;

      for (const application of applicationsToClean) {
        // 2. TeacherProfile의 transientDocuments 필드 정리 (일시 증빙 서류 삭제)
        if (application.user.teacherProfile?.transientDocuments) {
          await this.prisma.teacherProfile.update({
            where: { id: application.user.teacherProfile.id },
            data: {
              transientDocuments: null, // JSON 필드 초기화
            },
          });
          this.logger.log(`[COMPLIANCE] Cleaned transient documents for user ${application.userId}`);
        }

        // 3. 해당 지원서의 평가(Evaluation) 데이터도 비식별화 (점수만 유지, 개인정보 삭제)
        await this.prisma.evaluation.updateMany({
          where: { applicationId: application.id },
          data: {
            comment: null, // 심사평 삭제 (개인정보 포함 가능)
          },
        });

        cleanedCount++;
      }

      this.logger.log(`[COMPLIANCE] Recruitment document cleanup complete. Cleaned: ${cleanedCount}`);
      return { cleaned: cleanedCount };
    } catch (error) {
      this.logger.error(`[COMPLIANCE] Recruitment cleanup failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 개별 지원자의 서류 즉시 파기 요청 처리
   * 불합격자가 "채용 서류 반환/파기 요청"을 할 경우 호출
   */
  async immediateDocumentDestruction(applicationId: number): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[COMPLIANCE] Immediate destruction requested for application ${applicationId}`);

    try {
      const application = await this.prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
          user: {
            include: {
              teacherProfile: true,
            },
          },
        },
      });

      if (!application) {
        return { success: false, message: '지원서를 찾을 수 없습니다.' };
      }

      if (application.status !== 'REJECTED') {
        return { success: false, message: '탈락 상태의 지원서만 서류 파기를 요청할 수 있습니다.' };
      }

      // 일시 증빙 서류 삭제
      if (application.user.teacherProfile) {
        await this.prisma.teacherProfile.update({
          where: { id: application.user.teacherProfile.id },
          data: {
            transientDocuments: null,
          },
        });
      }

      // 심사평 삭제
      await this.prisma.evaluation.updateMany({
        where: { applicationId: application.id },
        data: {
          comment: null,
        },
      });

      this.logger.log(`[COMPLIANCE] Documents destroyed for application ${applicationId}`);
      return { success: true, message: '채용 서류가 파기되었습니다. 파기 확인서가 발급됩니다.' };
    } catch (error) {
      this.logger.error(`[COMPLIANCE] Immediate destruction failed: ${error.message}`);
      return { success: false, message: '서류 파기 중 오류가 발생했습니다.' };
    }
  }
}

