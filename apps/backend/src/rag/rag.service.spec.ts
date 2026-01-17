import { Test, TestingModule } from '@nestjs/testing';
import { RagService } from './rag.service';
import { PrismaService } from '../prisma.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';
import { ConfigService } from '@nestjs/config';

describe('RagService (Import Verification)', () => {
  let service: RagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: EmbeddingService,
          useValue: {},
        },
        {
          provide: ChunkingService,
          useValue: {},
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
  });

  it('should have pdfParse as a function (Runtime Check)', async () => {
    // Create a minimal valid-ish PDF buffer (header only)
    const mockPdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj < < /Type /Catalog >> endobj\ntrailer < < /Root 1 0 R >> %%EOF',
    );

    try {
      // Direct import to see what's happening
      const pLib = require('pdf-parse');
      console.log('--- DEBUG pdf-parse ---');
      console.log('pLib type:', typeof pLib);
      console.log('pLib keys:', Object.keys(pLib));
      if (pLib.default) {
        console.log('pLib.default type:', typeof pLib.default);
      }
      console.log('-----------------------');

      await service.ingestDocument({
        buffer: mockPdfBuffer,
        originalname: 'test.pdf',
      } as any);
    } catch (error) {
      console.log('Caught expected test error:', error.message);
      // If it's the "INITIALIZATION FAILED" error from rag.service.ts,
      // the module failed to even load properly due to our top-level check.
      expect(error.message).not.toContain('pdfParse is not a function');
    }
  });
});
