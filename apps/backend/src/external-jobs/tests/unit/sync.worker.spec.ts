
import { SyncWorker } from '../../sync/sync.worker';
import { PrismaService } from '../../../prisma.service';
import { ScraperService } from '../../scraper/scraper.service';
import { AiParserService } from '../../ai-parser/ai-parser.service';

const mockPrismaService = {
    jobListing: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        updateMany: jest.fn(),
    },
};

const mockScraperService = {
    scrapeSeoul: jest.fn(),
    scrapeDetail: jest.fn().mockResolvedValue({ content: 'Detail content' }),
};

const mockAiParserService = {
    parseJobPost: jest.fn(),
};

describe('SyncWorker', () => {
    let worker: SyncWorker;

    beforeEach(() => {
        worker = new SyncWorker(
            mockPrismaService as unknown as PrismaService,
            mockScraperService as unknown as ScraperService,
            mockAiParserService as unknown as AiParserService
        );
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(worker).toBeDefined();
    });

    it('should create new job if fingerprint does not exist', async () => {
        // Mock Scraper return
        mockScraperService.scrapeSeoul.mockResolvedValue([
            { title: 'Math Teacher', link: 'http://link', date: '2026-03-01' }
        ]);
        // Mock AI return
        mockAiParserService.parseJobPost.mockResolvedValue({
            schoolName: 'Test School',
            subject: 'Math',
            closingDate: '2026-03-10'
        });

        // Mock Prisma: findUnique returns null (not found)
        mockPrismaService.jobListing.findUnique.mockResolvedValue(null);

        await worker.syncSeoulJobs();

        expect(mockPrismaService.jobListing.create).toHaveBeenCalled();
        const createArgs = mockPrismaService.jobListing.create.mock.calls[0][0];
        expect(createArgs.data.isAggregated).toBe(true);
        expect(createArgs.data.externalSourceUrl).toBe('http://link');
    });

    it('should not create duplicate job if fingerprint exists', async () => {
        mockScraperService.scrapeSeoul.mockResolvedValue([
            { title: 'Math Teacher', link: 'http://link', date: '2026-03-01' }
        ]);
        mockAiParserService.parseJobPost.mockResolvedValue({
            schoolName: 'Test School',
            subject: 'Math',
            closingDate: '2026-03-10'
        });

        // Mock Prisma: findUnique returns existing job
        mockPrismaService.jobListing.findUnique.mockResolvedValue({ id: 1 });

        await worker.syncSeoulJobs();

        expect(mockPrismaService.jobListing.create).not.toHaveBeenCalled();
    });

    it('should soft delete jobs that are no longer in the scraped list', async () => {
        mockScraperService.scrapeSeoul.mockResolvedValue([
            { title: 'Job A', link: 'http://link-a', date: '2026-03-01' }
        ]);
        mockAiParserService.parseJobPost.mockResolvedValue({});

        await worker.syncSeoulJobs();

        expect(mockPrismaService.jobListing.updateMany).toHaveBeenCalled();
    });
});
