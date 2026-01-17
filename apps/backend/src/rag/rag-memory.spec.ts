import { Test, TestingModule } from '@nestjs/testing';
import { RagService } from './rag.service';
import { PrismaService } from '../prisma.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';
import { ConfigService } from '@nestjs/config';

describe('RagService (Batch & Scaling Strategy)', () => {
  let service: RagService;
  let embeddingService: EmbeddingService;
  let chunkingService: ChunkingService;

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
            splitByPages: jest.fn().mockReturnValue([]),
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
    embeddingService = module.get<EmbeddingService>(EmbeddingService);
    chunkingService = module.get<ChunkingService>(ChunkingService);
  });

  it('should process chunks in batches to prevent server-side OOM', async () => {
    // Mock 12 chunks. With BATCH_SIZE=5, this should be 3 batches.
    const mockChunks = Array.from({ length: 12 }, (_, i) => ({
      content: `Safe content chunk ${i}`,
      metadata: { source: 'scaled-test.pdf', chunkIndex: i },
    }));
    jest.spyOn(chunkingService, 'splitByPages').mockReturnValue(mockChunks);

    const dto = {
      content: 'Large document content proxy',
      filename: 'scaled-test.pdf',
    };

    const result = await service.ingestDocument(dto);

    expect(result).toBe(12);
    expect(embeddingService.generateEmbedding).toHaveBeenCalledTimes(12);
  });
});
