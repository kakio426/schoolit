import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { PrismaService } from '../prisma.service';
import { DiscordService } from './discord.service';

describe('FeedbackService', () => {
    let service: FeedbackService;
    let prisma: PrismaService;
    let discord: DiscordService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FeedbackService,
                {
                    provide: PrismaService,
                    useValue: {
                        feedback: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
                {
                    provide: DiscordService,
                    useValue: {
                        sendFeedbackNotification: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<FeedbackService>(FeedbackService);
        prisma = module.get<PrismaService>(PrismaService);
        discord = module.get<DiscordService>(DiscordService);
    });

    describe('create', () => {
        it('should create a feedback entry', async () => {
            const dto = {
                category: 'PROPOSAL',
                content: 'I want a new feature',
                userId: 1,
            };

            const expected = {
                id: 1,
                ...dto,
                status: 'PENDING',
                createdAt: new Date(),
                user: { email: 'test@test.com' } // Mocked user inclusion
            };

            jest.spyOn(prisma.feedback, 'create').mockResolvedValue(expected as any);

            const result = await service.create(dto);
            expect(result).toEqual(expected);
            expect(prisma.feedback.create).toHaveBeenCalledWith({
                data: {
                    category: dto.category,
                    content: dto.content,
                    userId: dto.userId,
                },
                include: { user: true },
            });
            expect(discord.sendFeedbackNotification).toHaveBeenCalledWith(
                dto.category,
                dto.content,
                'test@test.com',
                1
            );
        });
    });

    describe('reply', () => {
        it('should update feedback with a reply and change status to ANSWERED', async () => {
            const feedbackId = 1;
            const replyContent = 'Thank you for your feedback.';

            const expected = {
                id: feedbackId,
                content: 'Original Content',
                reply: replyContent,
                status: 'ANSWERED',
            };

            jest.spyOn(prisma.feedback, 'update').mockResolvedValue(expected as any);

            const result = await service.reply(feedbackId, replyContent);
            expect(result.reply).toBe(replyContent);
            expect(result.status).toBe('ANSWERED');
            expect(prisma.feedback.update).toHaveBeenCalled();
        });
    });
});
