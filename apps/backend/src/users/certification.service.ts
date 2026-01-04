import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CertificationService {
  constructor(private prisma: PrismaService) {}

  async createCertification(userId: number, data: { name: string; fileUrl: string }) {
    // Get or create teacher profile first
    const profile = await this.prisma.teacherProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return this.prisma.certification.create({
      data: {
        teacherProfileId: profile.id,
        name: data.name,
        fileUrl: data.fileUrl,
      },
    });
  }

  async getCertifications(userId: number) {
    const profile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: { certifications: true },
    });

    return profile?.certifications || [];
  }
}
