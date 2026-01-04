import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CertStatus } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async updateCertificationStatus(id: number, status: CertStatus) {
        // 1. Update the certification
        const cert = await this.prisma.certification.update({
            where: { id },
            data: { status },
            include: {
                teacherProfile: true,
            },
        });

        // 2. If approved, verify the teacher profile
        if (status === CertStatus.APPROVED) {
            await this.prisma.teacherProfile.update({
                where: { id: cert.teacherProfileId },
                data: { isVerified: true },
            });
        }

        return cert;
    }

    async getPendingCertifications() {
        return this.prisma.certification.findMany({
            where: { status: CertStatus.PENDING },
            include: {
                teacherProfile: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async getSystemStats() {
        const [totalUsers, totalJobs, totalSchools, totalTeachers] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.jobListing.count(),
            this.prisma.schoolProfile.count(),
            this.prisma.teacherProfile.count(),
        ]);

        return {
            totalUsers,
            totalJobs,
            totalSchools,
            totalTeachers,
        };
    }

    async getUsers(page: number, limit: number, search?: string) {
        const skip = (page - 1) * limit;
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                }
            }),
            this.prisma.user.count({ where })
        ]);

        return {
            data: users,
            total,
            page,
            limit
        };
    }
}
