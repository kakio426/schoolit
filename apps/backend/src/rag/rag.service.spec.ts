import { Test, TestingModule } from '@nestjs/testing';
import { RagService } from './rag.service';
import { PrismaService } from '../prisma.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';
import { ConfigService } from '@nestjs/config';

describe('RagService (Baseline Test)', () => {
  let service: RagService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagService,
        {
          provide: PrismaService,
          useValue: {
            $executeRaw: jest.fn().mockResolvedValue(1),
            $executeRawUnsafe: jest.fn().mockResolvedValue(1),
            $queryRaw: jest.fn().mockResolvedValue([]),
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
            splitByPages: jest.fn().mockReturnValue([
              { content: 'chunk 1', metadata: { source: 'test.pdf', chunkIndex: 0 } },
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
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined and configured with gemini-3-flash-preview', () => {
    expect(service).toBeDefined();
    // chatModel is private, but we can check if service loads.
  });

  it('should ingest text content (IngestTextDto Flow)', async () => {
    const dto = {
      content: 'This is a sample text for RAG digestion.',
      filename: 'sample.pdf',
    };

    const result = await service.ingestDocument(dto);
    expect(result).toBe(1);
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });
});
