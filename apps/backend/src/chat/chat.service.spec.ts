import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma.service';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;

  const mockPrismaService = {
    chatRoom: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    chatMessage: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRoom', () => {
    it('should return existing room if one exists', async () => {
      const existingRoom = { id: 1, users: [{ id: 1 }, { id: 2 }] };
      mockPrismaService.chatRoom.findFirst.mockResolvedValue(existingRoom);

      const result = await service.createRoom(1, 2);
      expect(result).toEqual(existingRoom);
      expect(prisma.chatRoom.create).not.toHaveBeenCalled();
    });

    it('should create new room if none exists', async () => {
      mockPrismaService.chatRoom.findFirst.mockResolvedValue(null);
      const newRoom = { id: 2, users: [{ id: 1 }, { id: 2 }] };
      mockPrismaService.chatRoom.create.mockResolvedValue(newRoom);

      const result = await service.createRoom(1, 2);
      expect(result).toEqual(newRoom);
      expect(prisma.chatRoom.create).toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('should throw forbidden if user not in room', async () => {
      mockPrismaService.chatRoom.findUnique.mockResolvedValue({
        id: 1,
        users: [{ id: 2 }, { id: 3 }],
      }); // User 1 not here

      await expect(service.sendMessage(1, 1, 'Hello')).rejects.toThrow('Access denied');
    });

    it('should send message if user is in room', async () => {
      mockPrismaService.chatRoom.findUnique.mockResolvedValue({
        id: 1,
        users: [{ id: 1 }, { id: 2 }],
      });
      const msg = { id: 1, content: 'Hello', senderId: 1 };
      mockPrismaService.chatMessage.create.mockResolvedValue(msg);

      const result = await service.sendMessage(1, 1, 'Hello');
      expect(result).toEqual(msg);
    });
  });
});
