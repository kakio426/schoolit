import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma.service';
import { NotificationsGateway } from './notifications.gateway';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsGateway,
          useValue: {
            server: {
              to: jest.fn().mockReturnThis(),
              emit: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a notification', async () => {
    const data = { userId: 1, type: 'TEST', title: 'Test', content: 'Content' };
    (prisma.notification.create as jest.Mock).mockResolvedValue(data);

    await service.create(data);
    expect(prisma.notification.create).toHaveBeenCalled();
  });
});
