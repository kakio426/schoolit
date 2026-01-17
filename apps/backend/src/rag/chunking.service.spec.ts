import { Test, TestingModule } from '@nestjs/testing';
import { ChunkingService, DocumentChunk } from './chunking.service';

describe('ChunkingService', () => {
    let service: ChunkingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ChunkingService],
        }).compile();

        service = module.get<ChunkingService>(ChunkingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('splitTextIntoChunks', () => {
        it('should split short text into single chunk', () => {
            const text = '이것은 짧은 테스트 문장입니다.';
            const chunks = service.splitTextIntoChunks(text, 'test.pdf');

            expect(chunks).toHaveLength(1);
            expect(chunks[0].content).toBe(text);
            expect(chunks[0].metadata.source).toBe('test.pdf');
            expect(chunks[0].metadata.chunkIndex).toBe(0);
        });

        it('should split long text into multiple chunks', () => {
            // Generate text longer than CHUNK_SIZE (800 chars)
            const longText = '안녕하세요. '.repeat(150); // ~1050 chars (was 200)
            const chunks = service.splitTextIntoChunks(longText, 'long.pdf');

            expect(chunks.length).toBeGreaterThan(1);
            expect(chunks[0].metadata.chunkIndex).toBe(0);
            expect(chunks[1].metadata.chunkIndex).toBe(1);
        });

        it('should preserve source metadata in all chunks', () => {
            const longText = 'A'.repeat(2000);
            const chunks = service.splitTextIntoChunks(longText, 'source.pdf');

            chunks.forEach((chunk) => {
                expect(chunk.metadata.source).toBe('source.pdf');
            });
        });

        it('should handle empty text', () => {
            const chunks = service.splitTextIntoChunks('', 'empty.pdf');
            expect(chunks).toHaveLength(0);
        });

        it('should handle whitespace-only text', () => {
            const chunks = service.splitTextIntoChunks('   \n\t   ', 'whitespace.pdf');
            expect(chunks).toHaveLength(0);
        });

        it('should clean excessive whitespace', () => {
            const text = '첫 번째    문장입니다.     두 번째 문장입니다.';
            const chunks = service.splitTextIntoChunks(text, 'test.pdf');

            expect(chunks[0].content).not.toContain('    ');
        });
    });

    describe('splitByPages', () => {
        it('should include page number in metadata when splitting by pages', () => {
            const textWithPageBreaks = '페이지 1 내용입니다.\f페이지 2 내용입니다.';
            const chunks = service.splitByPages(textWithPageBreaks, 'paged.pdf');

            expect(chunks.length).toBeGreaterThanOrEqual(2);
            expect(chunks[0].metadata.page).toBe(1);
            expect(chunks[1].metadata.page).toBe(2);
        });

        it('should handle text without page breaks', () => {
            const text = '페이지 구분이 없는 문서입니다.';
            const chunks = service.splitByPages(text, 'single.pdf');

            expect(chunks).toHaveLength(1);
            expect(chunks[0].metadata.page).toBe(1);
        });
    });
});
