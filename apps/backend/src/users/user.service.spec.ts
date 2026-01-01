import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dtos/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      const dto: CreateUserDto = {
        email: 'test@school.com',
        password: 'password123',
        role: Role.SCHOOL,
      };

      const expectedResult = {
        id: 1,
        ...dto,
        createdAt: new Date(),
      };

      jest.spyOn(prisma.user, 'create').mockResolvedValue(expectedResult as any);

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.email).toBe(dto.email);

      // Verify that create was called with hashed password
      const createCallArgs = (prisma.user.create as jest.Mock).mock.calls[0][0];
      expect(createCallArgs.data.password).not.toBe(dto.password);
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });
});
