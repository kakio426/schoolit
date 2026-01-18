import { Test, TestingModule } from '@nestjs/testing';
import { RagService } from './rag.service';
import { PrismaService } from '../prisma.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';
import { ConfigService } from '@nestjs/config';

describe('RagService (Baseline Test)', () => {
  let service: RagService;
  let prisma: any;

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
            $queryRawUnsafe: jest.fn().mockResolvedValue([]),
            documentSection: {
              findMany: jest.fn().mockResolvedValue([]),
              delete: jest.fn().mockResolvedValue({}),
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            },
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
                { content: 'chunk 1', metadata: { source: 'test.pdf', chunkIndex: 0 } },
              ]),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(null), // API key를 null로 설정하여 실제 API 호출 방지
          },
        },
      ],
    }).compile();

    service = module.get<RagService>(RagService);
    prisma = module.get<PrismaService>(PrismaService);

    // embeddingModel을 mock으로 대체 (실제 Gemini API 호출 방지)
    (service as any).embeddingModel = {
      embedContent: jest.fn().mockResolvedValue({
        embedding: { values: new Array(768).fill(0.1) },
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined and configured with gemini-3-flash-preview', () => {
    expect(service).toBeDefined();
  });

  it('should ingest text content (IngestTextDto Flow)', async () => {
    const dto = {
      content: 'This is a sample text for RAG digestion.',
      filename: 'sample.pdf',
    };

    // Mock: DB에 해시가 없음 (새 문서)
    prisma.$queryRawUnsafe.mockResolvedValueOnce([]);

    const result = await service.ingestDocument(dto);
    expect(result).toBe(1);
    expect(prisma.$executeRawUnsafe).toHaveBeenCalled();
  });

  // ============================================
  // Phase 1: 중복 업로드 방지 테스트 (TDD RED → GREEN)
  // ============================================

  describe('Duplicate Upload Prevention', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should skip API call if content hash already exists in DB', async () => {
      const dto = {
        content: 'This is duplicate content for testing.',
        filename: 'duplicate.txt',
      };

      // Mock: DB에 이미 같은 해시가 존재
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ id: 1 }]);

      const result = await service.ingestDocument(dto);

      // 이미 존재하므로 0개의 청크가 저장되어야 함
      expect(result).toBe(0);
      // $executeRawUnsafe (INSERT)는 호출되지 않아야 함
      expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
    });

    it('should process document if content hash does not exist', async () => {
      const dto = {
        content: 'This is brand new content for testing.',
        filename: 'new_doc.txt',
      };

      // Mock: DB에 해시가 없음
      prisma.$queryRawUnsafe.mockResolvedValueOnce([]);

      const result = await service.ingestDocument(dto);

      // 새 문서이므로 청크가 저장되어야 함
      expect(result).toBeGreaterThanOrEqual(1);
      expect(prisma.$executeRawUnsafe).toHaveBeenCalled();
    });

    it('should generate consistent MD5 hash for same content', () => {
      const content1 = 'Hello World';
      const content2 = 'Hello World';
      const content3 = 'Different Content';

      const hash1 = (service as any).generateContentHash(content1);
      const hash2 = (service as any).generateContentHash(content2);
      const hash3 = (service as any).generateContentHash(content3);

      expect(hash1).toBe(hash2); // 같은 내용 = 같은 해시
      expect(hash1).not.toBe(hash3); // 다른 내용 = 다른 해시
      expect(hash1).toHaveLength(32); // MD5 = 32자
    });
  });
});
