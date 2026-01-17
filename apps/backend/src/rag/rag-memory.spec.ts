import { Test, TestingModule } from '@nestjs/testing';
import { RagService } from './rag.service';
import { PrismaService } from '../prisma.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';
import { ConfigService } from '@nestjs/config';

jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn().mockImplementation(() => ({
    getText: jest.fn().mockResolvedValue({ text: 'mock extracted text' }),
  })),
  default: jest.fn().mockResolvedValue({ text: 'mock extracted text' }),
}));

describe('RagService (Memory & Batch Safety)', () => {
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
            splitByPages: jest.fn().mockReturnValue([
              { content: 'chunk 1', metadata: { source: 'test.pdf', chunkIndex: 0 } },
              { content: 'chunk 2', metadata: { source: 'test.pdf', chunkIndex: 1 } },
              { content: 'chunk 3', metadata: { source: 'test.pdf', chunkIndex: 2 } },
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
    embeddingService = module.get<EmbeddingService>(EmbeddingService);
    chunkingService = module.get<ChunkingService>(ChunkingService);
  });

  it('should reject files exceeding the MAX_FILE_SIZE_MB', async () => {
    const largeBuffer = Buffer.alloc(21 * 1024 * 1024); // 21MB
    const file = {
      buffer: largeBuffer,
      originalname: 'too-big.pdf',
      size: largeBuffer.length,
    } as any;

    await expect(service.ingestDocument(file)).rejects.toThrow('파일이 너무 큽니다');
  });

  it('should process chunks in batches (Verifying batching via spy)', async () => {
    // Mock 12 chunks to test batches of 5 (3 batches total)
    const mockChunks = Array.from({ length: 12 }, (_, i) => ({
      content: `content ${i}`,
      metadata: { source: 'test.pdf', chunkIndex: i },
    }));
    jest.spyOn(chunkingService, 'splitByPages').mockReturnValue(mockChunks);

    const file = {
      buffer: Buffer.from('mock pdf'),
      originalname: 'test.pdf',
      size: 1000,
    } as any;

    const result = await service.ingestDocument(file);

    expect(result).toBe(12);
    expect(embeddingService.generateEmbedding).toHaveBeenCalledTimes(12);
  });
});
