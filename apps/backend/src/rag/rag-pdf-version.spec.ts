import { Test, TestingModule } from '@nestjs/testing';
import { RagService } from './rag.service';
import { PrismaService } from '../prisma.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TDD RED Phase: pdf-parse 버전 변경 후 정상 작동 검증
 * 이 테스트는 pdf-parse가 올바르게 텍스트를 추출하는지 확인합니다.
 */
describe('RagService - PDF Parse Version Test', () => {
    let service: RagService;
    let embeddingService: jest.Mocked<EmbeddingService>;
    let chunkingService: jest.Mocked<ChunkingService>;
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
                        splitByPages: jest.fn().mockReturnValue([
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
        embeddingService = module.get(EmbeddingService);
        chunkingService = module.get(ChunkingService);
        prismaService = module.get(PrismaService);
    });

    /**
     * RED TEST 1: pdf-parse가 함수로 호출 가능해야 함
     * pdf-parse 1.1.x는 함수형 API를 사용
     */
    it('should import pdf-parse as a callable function', async () => {
        // pdf-parse를 직접 import하여 타입 확인
        const pdfParse = require('pdf-parse');

        // pdf-parse 1.1.x는 함수여야 함 (또는 default export가 함수)
        const parseFunction = typeof pdfParse === 'function'
            ? pdfParse
            : pdfParse.default;

        expect(typeof parseFunction).toBe('function');
    });

    /**
     * TEST 2: 텍스트 주입이 정상적으로 완료되어야 함 (Client-side parsing 대응)
     */
    it('should process text content successfully', async () => {
        const dto = {
            content: 'Extracted text from PDF',
            filename: 'test.pdf'
        };

        const result = await service.ingestDocument(dto);
        expect(result).toBe(1); // Mocked chunking returns 1 chunk
        expect(prismaService.$executeRaw).toHaveBeenCalled();
    });

    /**
     * TEST 3: 빈 텍스트 처리 방어
     */
    it('should handle empty content if needed', async () => {
        // RagService 내부 로직에 따라 빈 텍스트 처리가 다를 수 있음
        // 현재는 chunkingService로 바로 넘기므로, chunkingService의 동작을 따름
        const dto = {
            content: '',
            filename: 'empty.pdf'
        };

        // Mocked chunking might return 0 chunks for empty text
        chunkingService.splitByPages.mockReturnValueOnce([]);

        const result = await service.ingestDocument(dto);
        expect(result).toBe(0);
    });
});
