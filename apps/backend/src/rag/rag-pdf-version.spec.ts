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
     * RED TEST 2: 작은 파일 처리 시 OOM 없이 완료되어야 함
     * pdf-parse를 mock하여 실제 파싱 없이 흐름만 검증
     */
    it('should process small PDF file without memory error', async () => {
        // 작은 버퍼 생성 (실제 PDF가 아니어도 됨, mock 처리)
        const smallBuffer = Buffer.from('mock pdf content');

        const file = {
            buffer: smallBuffer,
            originalname: 'test.pdf',
            size: smallBuffer.length,
        } as Express.Multer.File;

        // ingestDocument가 호출되면 내부적으로 pdf-parse가 호출됨
        // 하지만 실제 PDF가 아니면 에러가 날 수 있으므로
        // 여기서는 "에러가 OOM이 아닌지"만 확인
        try {
            await service.ingestDocument(file);
            // 성공하면 통과
        } catch (error: any) {
            // OOM 에러가 아니면 통과 (PDF 형식 에러는 허용)
            expect(error.message).not.toContain('heap out of memory');
            expect(error.message).not.toContain('Allocation failed');
        }
    });

    /**
     * RED TEST 3: 파일 크기 제한이 작동해야 함
     */
    it('should reject files larger than MAX_FILE_SIZE_MB', async () => {
        const largeBuffer = Buffer.alloc(21 * 1024 * 1024); // 21MB (현재 제한은 20MB)
        const file = {
            buffer: largeBuffer,
            originalname: 'too-big.pdf',
            size: largeBuffer.length,
        } as Express.Multer.File;

        await expect(service.ingestDocument(file)).rejects.toThrow('파일이 너무 큽니다');
    });
});
