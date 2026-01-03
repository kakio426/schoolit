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
}
