import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { HiringWorkflowStatus, EvaluationType, Prisma } from '@prisma/client';

@Injectable()
export class ComplianceService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * 호봉 상한 확인 (2025 지침: 명예퇴직자 등 14호봉 제한)
     */
    validateSalaryStep(salaryStep: number, isHonoraryRetiree: boolean = false): {
        isValid: boolean;
        message: string;
    } {
        const maxStep = isHonoraryRetiree ? 14 : 40;

        if (salaryStep > maxStep) {
            return {
                isValid: false,
                message: isHonoraryRetiree
                    ? `명예퇴직자의 호봉은 ${maxStep}호봉을 초과할 수 없습니다.`
                    : `호봉이 ${maxStep}호봉을 초과할 수 없습니다.`,
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * 계약 기간 유효성 검사 (병가+출산휴가 1개월 이상 필요)
     */
    validateContractDuration(
        hiringReason: string,
        startDate: Date,
        endDate: Date
    ): { isValid: boolean; message: string } {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = diffDays / 30;

        if ((hiringReason === 'SICK_LEAVE' || hiringReason === 'MATERNITY') && diffMonths < 1) {
            return {
                isValid: false,
                message: '병가 및 출산휴가의 합산 기간이 1개월 미만인 경우 기간제교원 채용이 제한됩니다.',
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * 워크플로우 상태 업데이트 (상태 머신 로직)
     */
    async updateWorkflowStatus(
        jobId: number,
        newStatus: HiringWorkflowStatus
    ): Promise<{ success: boolean; message: string }> {
        const job = await this.prisma.jobListing.findUnique({
            where: { id: jobId },
            select: { workflowStatus: true },
        });

        if (!job) {
            return { success: false, message: '공고를 찾을 수 없습니다.' };
        }

        // 상태 전이 규칙: DRAFT -> PLAN_APPROVED -> PUBLISHED -> ...
        const validTransitions: Record<HiringWorkflowStatus, HiringWorkflowStatus[]> = {
            DRAFT: ['PLAN_APPROVED', 'CANCELLED'],
            PLAN_APPROVED: ['PUBLISHED', 'DRAFT', 'CANCELLED'],
            PUBLISHED: ['RECEIVING', 'CANCELLED'],
            RECEIVING: ['SCREENING', 'CANCELLED'],
            SCREENING: ['INTERVIEW', 'CANCELLED'],
            INTERVIEW: ['DEMONSTRATION', 'FINALIZING', 'CANCELLED'],
            DEMONSTRATION: ['FINALIZING', 'CANCELLED'],
            FINALIZING: ['CONTRACTED', 'CANCELLED'],
            CONTRACTED: [],
            CANCELLED: [],
        };

        const currentStatus = job.workflowStatus;
        const allowedNextStatuses = validTransitions[currentStatus] || [];

        if (!allowedNextStatuses.includes(newStatus)) {
            return {
                success: false,
                message: `${currentStatus} 상태에서 ${newStatus}로 전환할 수 없습니다.`,
            };
        }

        const data: Prisma.JobListingUpdateInput = { workflowStatus: newStatus };

        if (newStatus === HiringWorkflowStatus.PUBLISHED || newStatus === HiringWorkflowStatus.RECEIVING) {
            data.status = 'OPEN'; // Using string literal or ensure JobStatus is imported
        } else if (newStatus === HiringWorkflowStatus.CANCELLED || newStatus === HiringWorkflowStatus.DRAFT) {
            data.status = 'CLOSED';
        }

        await this.prisma.jobListing.update({
            where: { id: jobId },
            data,
        });

        return { success: true, message: '상태가 업데이트되었습니다.' };
    }

    /**
     * 평가 점수 저장
     */
    async saveEvaluation(data: {
        jobListingId: number;
        applicationId: number;
        evaluatorName: string;
        evaluatorRole?: string;
        type: EvaluationType;
        criteriaScores: Record<string, number>;
        comment?: string;
        meritBonus?: number;
    }): Promise<{ id: number; totalScore: number }> {
        const totalScore = Object.values(data.criteriaScores).reduce((sum, s) => sum + s, 0);

        const evaluation = await this.prisma.evaluation.create({
            data: {
                jobListingId: data.jobListingId,
                applicationId: data.applicationId,
                evaluatorName: data.evaluatorName,
                evaluatorRole: data.evaluatorRole,
                type: data.type,
                totalScore,
                criteriaScores: data.criteriaScores as Prisma.InputJsonValue,
                comment: data.comment,
                meritBonus: data.meritBonus || 0,
            },
        });

        return { id: evaluation.id, totalScore };
    }

    /**
     * 지원자별 종합 점수 집계 (서식 15)
     */
    async aggregateScores(jobListingId: number): Promise<{
        applicationId: number;
        applicantName: string;
        documentScore: number;
        interviewScore: number;
        demonstrationScore: number;
        meritBonus: number;
        totalScore: number;
        rank: number;
    }[]> {
        const evaluations = await this.prisma.evaluation.findMany({
            where: { jobListingId },
            include: {
                application: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
        });

        // Group by applicationId
        const scoreMap = new Map<number, {
            applicantName: string;
            documentScore: number;
            interviewScore: number;
            demonstrationScore: number;
            meritBonus: number;
        }>();

        for (const ev of evaluations) {
            const appId = ev.applicationId;
            const existing = scoreMap.get(appId) || {
                applicantName: ev.application.user.name || '알 수 없음',
                documentScore: 0,
                interviewScore: 0,
                demonstrationScore: 0,
                meritBonus: 0,
            };

            // Average scores from multiple evaluators (if multiple)
            switch (ev.type) {
                case 'DOCUMENT':
                    existing.documentScore = Math.max(existing.documentScore, ev.totalScore);
                    break;
                case 'INTERVIEW':
                    existing.interviewScore = Math.max(existing.interviewScore, ev.totalScore);
                    break;
                case 'DEMONSTRATION':
                    existing.demonstrationScore = Math.max(existing.demonstrationScore, ev.totalScore);
                    break;
            }
            existing.meritBonus = Math.max(existing.meritBonus, ev.meritBonus);

            scoreMap.set(appId, existing);
        }

        // Calculate totals and rank
        const results = Array.from(scoreMap.entries()).map(([applicationId, scores]) => ({
            applicationId,
            ...scores,
            totalScore: scores.documentScore + scores.interviewScore + scores.demonstrationScore + scores.meritBonus,
        }));

        // Sort by total score descending
        results.sort((a, b) => b.totalScore - a.totalScore);

        // Assign ranks
        return results.map((r, index) => ({ ...r, rank: index + 1 }));
    }
}
