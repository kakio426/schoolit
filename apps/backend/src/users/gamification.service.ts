import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TrustTier, BadgeType, Role, User } from '@prisma/client';

@Injectable()
export class GamificationService {
    constructor(private prisma: PrismaService) { }

    /**
     * Calculates the profile completeness percentage for a user.
     */
    async calculateProfileCompleteness(userId: number): Promise<{ percentage: number; missingFields: string[] }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                teacherProfile: { include: { educations: true, experiences: true } },
                schoolProfile: true,
                businessProfile: { include: { portfolios: true } },
            },
        });

        if (!user) return { percentage: 0, missingFields: [] };

        let score = 0;
        const totalScore = 100;
        const missing: string[] = [];

        // 1. Basic Info (20%)
        if (user.name) score += 10; else missing.push('이름');
        if (user.email) score += 10; else missing.push('이메일');

        // 2. Role Specifics (80%)
        if (user.role === Role.TEACHER && user.teacherProfile) {
            const p = user.teacherProfile;
            if (p.profileImage) score += 20; else missing.push('프로필 사진');
            if (p.bio) score += 20; else missing.push('자기소개');
            if (p.subjects && p.subjects.length > 0) score += 10; else missing.push('담당 과목');
            if (p.regions && p.regions.length > 0) score += 10; else missing.push('활동 지역');
            // Additional 20 for extra details
            if (p.educations && p.educations.length > 0) score += 10;
            if (p.experiences && p.experiences.length > 0) score += 10;
        }
        else if (user.role === Role.SCHOOL && user.schoolProfile) {
            const p = user.schoolProfile;
            if (p.logoImage) score += 20; else missing.push('학교 로고');
            if (p.description) score += 20; else missing.push('학교 소개');
            if (p.address) score += 20; else missing.push('주소');
            if (p.phoneNumber) score += 20; else missing.push('대표 전화번호');
        }
        else if (user.role === Role.BUSINESS && user.businessProfile) {
            const p = user.businessProfile;
            if (p.description) score += 20; else missing.push('가게/기업 소개');
            if (p.address) score += 20; else missing.push('주소');
            if (p.categories && p.categories.length > 0) score += 20; else missing.push('카테고리 설정');
            if (p.portfolios && p.portfolios.length > 0) score += 20; else missing.push('포트폴리오 등록');
        }

        // Cap at 100
        const finalPercentage = Math.min(score, 100);

        // Award Badge if 100%
        if (finalPercentage === 100) {
            this.awardBadge(userId, BadgeType.PROFILE_MASTER);
        }

        return { percentage: finalPercentage, missingFields: missing };
    }

    /**
     * Updates the User's Trust Tier based on their current status and achievements.
     */
    async updateTrustTier(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                teacherProfile: true,
                schoolProfile: true,
                businessProfile: true,
                reviewsReceived: true,
            },
        });

        if (!user) return;

        let currentTier = TrustTier.NEW;

        // Lv.2 Verified: Valid phone number
        if (user.phone) {
            currentTier = TrustTier.VERIFIED;
        }

        // Lv.3 Trusted: Verified + Profile Verification (simplified logic)
        // In real app, check 'isVerified' flag which admin/system sets
        const isProfileVerified =
            user.teacherProfile?.isVerified ||
            user.schoolProfile?.isVerified ||
            user.businessProfile?.isVerified;

        if (currentTier === TrustTier.VERIFIED && isProfileVerified) {
            // Also require profile image for TRUSTED
            const hasImage = user.teacherProfile?.profileImage || user.schoolProfile?.logoImage; // Business might not need it?
            if (hasImage) {
                currentTier = TrustTier.TRUSTED;
            }
        }

        // Lv.4 Top Rated: Trusted + Ratings
        if (currentTier === TrustTier.TRUSTED) {
            const reviewCount = user.reviewsReceived.length;
            const avgRating = user.reviewsReceived.reduce((acc, r) => acc + (r.rating || 0), 0) / (reviewCount || 1);

            if (reviewCount >= 5 && avgRating >= 4.5) {
                currentTier = TrustTier.TOP_RATED;
            }
        }

        // Update if changed
        if (user.trustTier !== currentTier) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { trustTier: currentTier },
            });
        }

        return currentTier;
    }

    /**
     * Awards a badge to a user if they don't have it already.
     */
    async awardBadge(userId: number, type: BadgeType) {
        try {
            await this.prisma.userBadge.create({
                data: { userId, type },
            });
            return true;
        } catch (e) {
            // Unique constraint violation means already has badge, ignore
            return false;
        }
    }

    /**
     * Checks for various badges (Veteran, High Return, etc.)
     * Should be called after key events (e.g. Job completion, Review received)
     */
    async checkActivityBadges(userId: number) {
        // 1. Veteran: 10+ Reviews (Proxy for completed jobs)
        const reviewCount = await this.prisma.review.count({ where: { receiverId: userId } });
        if (reviewCount >= 10) {
            await this.awardBadge(userId, BadgeType.VETERAN);
        }

        // 2. High Return: Re-match intent > 80% (min 5 reviews)
        if (reviewCount >= 5) {
            const positiveReviews = await this.prisma.review.count({
                where: { receiverId: userId, reMatchIntent: true }
            });
            const rate = positiveReviews / reviewCount;
            if (rate >= 0.8) {
                await this.awardBadge(userId, BadgeType.HIGH_RETURN);
            }
        }
    }
}
