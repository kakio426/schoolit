import { Injectable, Logger, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService, DocumentChunk } from './chunking.service';
import { IngestTextDto } from './dto/ingest-text.dto';

export interface SearchResult {
  content: string;
  metadata: {
    source: string;
    page?: number;
    chunkIndex: number;
  };
  similarity: number;
}

export interface RagResponse {
  answer: string;
  sources: Array<{
    source: string;
    page?: number;
    snippet: string;
  }>;
}

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private genAI: GoogleGenerativeAI;
  private chatModel: any;

  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
    private chunkingService: ChunkingService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.chatModel = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
      });
    }
  }

  async onModuleInit() {
    this.logger.log('Initializing RAG database schema...');
    try {
      await this.prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
      this.logger.log('pgvector extension enabled');

      await this.prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS document_sections (
                    id SERIAL PRIMARY KEY,
                    content TEXT NOT NULL,
                    metadata JSONB,
                    embedding vector(768),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            `);
      this.logger.log('document_sections table ready');

      await this.prisma.$executeRawUnsafe(`
                CREATE INDEX IF NOT EXISTS idx_document_sections_embedding 
                ON document_sections USING hnsw (embedding vector_cosine_ops);
            `);
      this.logger.log('Vector index ready');
      this.logger.log('RAG database schema initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize RAG schema:', error);
    }
  }

  private readonly BATCH_SIZE = 2; // Stability First: 502 에러 방지를 위해 배치 크기 대폭 축소

  /**
   * Ingest extracted text into vector database (Client-Side Parsing)
   */
  async ingestDocument(dto: IngestTextDto): Promise<number> {
    this.logger.log(`[RAG] Starting Ingest for ${dto.filename} (${dto.content.length} chars)`);

    const text = dto.content;
    const chunks = this.chunkingService.splitByPages(text, dto.filename);

    // --- Safety Guard: Check for empty chunks to prevent 500 Error (undefined length) ---
    if (!chunks || chunks.length === 0) {
      this.logger.warn(`[RAG] Chunking failed or returned empty result for ${dto.filename}`);
      // 사용자에게 "서버가 죽었다"는 500 대신 명확한 에러 메시지 전달 (하지만 HTTP status는 500 유지하되 메시지 명시)
      throw new InternalServerErrorException('텍스트를 처리하는 도중 문제가 발생했습니다. (Chunking Failed: No output)');
    }
    // --------------------------------------------------------------------------------

    this.logger.log(`[RAG] Created ${chunks.length} chunks. Using BATCH_SIZE=${this.BATCH_SIZE}`);

    let storedCount = 0;
    const totalBatches = Math.ceil(chunks.length / this.BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * this.BATCH_SIZE;
      const end = Math.min(start + this.BATCH_SIZE, chunks.length);
      const batch = chunks.slice(start, end);

      this.logger.log(`[RAG] Processing Batch ${batchIndex + 1}/${totalBatches} (${batch.length} chunks)`);

      const batchResults = await Promise.all(
        batch.map(async (chunk, idx) => {
          try {
            const embedding = await this.embeddingService.generateEmbedding(chunk.content);
            await this.prisma.$executeRaw`
              INSERT INTO document_sections (content, metadata, embedding, created_at, updated_at)
              VALUES (
                ${chunk.content},
                ${JSON.stringify(chunk.metadata)}::jsonb,
                ${JSON.stringify(embedding)}::vector,
                NOW(),
                NOW()
              )
            `;
            return true;
          } catch (error) {
            this.logger.error(`[RAG] Error in Chunk ${start + idx}:`, error?.message || error);
            return false;
          }
        }),
      );

      storedCount += batchResults.filter((r) => r).length;

      // Give breath to the event loop
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    this.logger.log(`[RAG] Ingest Complete. Stored ${storedCount}/${chunks.length} chunks.`);
    return storedCount;
  }

  async searchSimilar(query: string, topK = 3): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    const results = await this.prisma.$queryRaw<SearchResult[]>`
      SELECT 
        content,
        metadata,
        1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) AS similarity
      FROM document_sections
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT ${topK}
    `;

    return results;
  }

  async askQuestion(question: string): Promise<RagResponse> {
    this.logger.log(`Processing question: ${question}`);
    const relevantDocs = await this.searchSimilar(question, 3);

    if (relevantDocs.length === 0) {
      return {
        answer: '관련된 문서를 찾을 수 없습니다. 먼저 문서를 업로드해 주세요.',
        sources: [],
      };
    }

    const context = relevantDocs
      .map(
        (doc, i) =>
          `[출처 ${i + 1}: ${doc.metadata.source}${doc.metadata.page ? `, ${doc.metadata.page}페이지` : ''}]\n${doc.content}`,
      )
      .join('\n\n---\n\n');

    const prompt = `당신은 학교 행정 전문가입니다. 
아래 참고 문서를 바탕으로 질문에 정확하게 답변해주세요.

## 지침
- 반드시 제공된 문서에 근거한 답변만 하세요.
- 문서에 없는 내용은 "해당 내용은 제공된 문서에서 확인되지 않습니다"라고 답하세요.
- 답변 시 어떤 출처를 참고했는지 명시하세요.
- 친절하고 명확하게 설명하세요.

## 참고 문서
${context}

## 질문
${question}

## 답변`;

    const result = await this.chatModel.generateContent(prompt);
    const answer = result.response.text();

    return {
      answer,
      sources: relevantDocs.map((doc) => ({
        source: doc.metadata.source,
        page: doc.metadata.page,
        snippet: doc.content.slice(0, 100) + '...',
      })),
    };
  }

  async getStats(): Promise<{ totalChunks: number; sources: string[] }> {
    const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM document_sections
    `;

    const sourcesResult = await this.prisma.$queryRaw<Array<{ source: string }>>`
      SELECT DISTINCT metadata->>'source' as source 
      FROM document_sections
      WHERE metadata->>'source' IS NOT NULL
    `;

    return {
      totalChunks: Number(countResult[0]?.count || 0),
      sources: sourcesResult.map((r) => r.source),
    };
  }

  async clearDocuments(): Promise<void> {
    await this.prisma.$executeRaw`DELETE FROM document_sections`;
    this.logger.log('All document sections cleared');
  }
}
