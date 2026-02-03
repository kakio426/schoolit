import { Test, TestingModule } from '@nestjs/testing';
import { RagService } from './rag.service';
import { PrismaService } from '../prisma.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';
import { ConfigService } from '@nestjs/config';

describe('RagService (Client-Side Parsing Flow Verification)', () => {
  let service: RagService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagService,
        {
          provide: PrismaService,
          useValue: {
            $executeRaw: jest.fn().mockResolvedValue(1),
            $queryRaw: jest.fn().mockResolvedValue([]),
            $executeRawUnsafe: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: EmbeddingService,
          useValue: {
            generateEmbedding: jest.fn().mockResolvedValue(new Array(768).fill(0.1)),
          },
        },
        {
          provide: ChunkingService,
          useValue: {
            splitByPages: jest
              .fn()
              .mockReturnValue([
                { content: 'test content', metadata: { source: 'test.pdf', chunkIndex: 0 } },
              ]),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<RagService>(RagService);
    prismaService = module.get<PrismaService>(PrismaService) as any;
  });

  it('should accept text content from client and store in vector DB (gemini-2.5-flash compatible)', async () => {
    const dto = {
      content: 'Extracted text content from modern frontend parser',
      filename: 'modern-test.pdf',
    };

    const result = await service.ingestDocument(dto);
    expect(result).toBe(1);
    expect(prismaService.$executeRaw).toHaveBeenCalled();
  });
});
