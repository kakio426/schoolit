import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmbeddingService } from './embedding.service';

// Mock GoogleGenerativeAI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      embedContent: jest.fn().mockResolvedValue({
        embedding: {
          values: new Array(768).fill(0.1), // Mock 768-dimensional vector
        },
      }),
    }),
  })),
}));

describe('EmbeddingService', () => {
  let service: EmbeddingService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateEmbedding', () => {
    it('should return a 768-dimensional vector', async () => {
      const embedding = await service.generateEmbedding('테스트 텍스트');

      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding).toHaveLength(768);
    });

    it('should return numeric values', async () => {
      const embedding = await service.generateEmbedding('test');

      embedding.forEach((value) => {
        expect(typeof value).toBe('number');
      });
    });
  });

  describe('generateBatchEmbeddings', () => {
    it('should return embeddings for all input texts', async () => {
      const texts = ['첫 번째 텍스트', '두 번째 텍스트', '세 번째 텍스트'];
      const embeddings = await service.generateBatchEmbeddings(texts);

      expect(embeddings).toHaveLength(3);
      embeddings.forEach((embedding) => {
        expect(embedding).toHaveLength(768);
      });
    });

    it('should handle empty array', async () => {
      const embeddings = await service.generateBatchEmbeddings([]);
      expect(embeddings).toHaveLength(0);
    });
  });
});
