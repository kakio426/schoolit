import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma.service';
import { ChatService } from '../chat/chat.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { NotificationsService } from '../notifications/notifications.service';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    jobListing: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    jobApplication: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockChatService = {
    createRoom: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockPdfGeneratorService = {
    generateContract: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ChatService, useValue: mockChatService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: PdfGeneratorService, useValue: mockPdfGeneratorService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('suggestJob', () => {
    it('should throw Forbidden if job does not belong to school', async () => {
      mockPrismaService.jobListing.findUnique.mockResolvedValue({
        id: 1,
        schoolProfile: { userId: 99 }, // Different user
      });

      await expect(service.suggestJob(1, 1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFound if teacher does not exist', async () => {
      mockPrismaService.jobListing.findUnique.mockResolvedValue({
        id: 1,
        schoolProfile: { userId: 1 },
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.suggestJob(1, 1, 2)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequest if already applied', async () => {
      mockPrismaService.jobListing.findUnique.mockResolvedValue({
        id: 1,
        schoolProfile: { userId: 1 },
      });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 2, role: 'TEACHER' });
      mockPrismaService.jobApplication.findUnique.mockResolvedValue({ id: 10 });

      await expect(service.suggestJob(1, 1, 2)).rejects.toThrow(BadRequestException);
    });

    it('should create suggestion if all valid', async () => {
      mockPrismaService.jobListing.findUnique.mockResolvedValue({
        id: 1,
        schoolProfile: { userId: 1 },
      });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 2, role: 'TEACHER' });
      mockPrismaService.jobApplication.findUnique.mockResolvedValue(null);
      mockPrismaService.jobApplication.create.mockResolvedValue({ id: 11, isSuggestion: true });

      const result = await service.suggestJob(1, 1, 2);
      expect(result.isSuggestion).toBe(true);
      expect(mockPrismaService.jobApplication.create).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should create a chat room when status is updated to INTERVIEWING', async () => {
      const mockApp = {
        id: 11,
        userId: 2, // Teacher
        jobId: 1,
        isSuggestion: true,
        status: 'PENDING',
        jobListing: {
          schoolProfile: { userId: 1 },
        },
      };
      mockPrismaService.jobApplication.findUnique.mockResolvedValue(mockApp);
      mockPrismaService.jobApplication.update.mockResolvedValue({
        ...mockApp,
        status: 'INTERVIEWING',
        user: { id: 2, name: 'Teacher', phone: '123' },
      });

      await service.updateStatus(1, 11, 'INTERVIEWING' as any);

      expect(mockChatService.createRoom).toHaveBeenCalledWith(1, 2, 1);
    });
  });
  describe('updateCompliance', () => {
    it('should throw Forbidden if user is not the job owner', async () => {
      const mockApp = { jobListing: { schoolProfile: { userId: 99 } } };
      mockPrismaService.jobApplication.findUnique.mockResolvedValue(mockApp);

      await expect(service.updateCompliance(1, 1, {})).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequest if mandatory 2025 items are missing', async () => {
      const mockApp = { jobListing: { schoolProfile: { userId: 1 } } };
      mockPrismaService.jobApplication.findUnique.mockResolvedValue(mockApp);

      // Missing 'narcotics_check'
      const invalidChecklist = {
        sex_offender_check: true,
        child_abuse_check: true,
      };

      await expect(service.updateCompliance(1, 1, invalidChecklist)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update checklist if all mandatory items are verified', async () => {
      const mockApp = { id: 1, jobListing: { schoolProfile: { userId: 1 } } };
      mockPrismaService.jobApplication.findUnique.mockResolvedValue(mockApp);
      mockPrismaService.jobApplication.update.mockResolvedValue({
        ...mockApp,
        complianceChecklist: {},
      });

      const validChecklist = {
        sex_offender_check: true,
        child_abuse_check: true,
        narcotics_check: true, // 2025 New
        family_hiring_restriction: true, // 2025 New
      };

      await service.updateCompliance(1, 1, validChecklist);
      expect(mockPrismaService.jobApplication.update).toHaveBeenCalled();
    });
  });
});
