import { Injectable, Logger, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';
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
      // 선생님이 설정하신 2026년 최신 모델 사용
      this.chatModel = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
      });
    }
  }

  async onModuleInit() {
    this.logger.log('Initializing RAG database settings...');
    try {
      // [수정 1] 테이블 생성은 Prisma Migration에 맡기고, 여기서는 확장 기능 활성화만 확인합니다.
      // Railway 등 클라우드 환경에서는 권한 문제로 실패할 수 있으니, 로그만 남기고 넘어갑니다.
      await this.prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
      this.logger.log('pgvector extension enabled');
    } catch (error) {
      this.logger.warn('Warning: Failed to enable pgvector extension. It might be already enabled or requires superuser permissions.', error);
    }
  }

  private readonly BATCH_SIZE = 5;

  async ingestDocument(dto: IngestTextDto): Promise<number> {
    this.logger.log(`[RAG] Starting Ingest for ${dto.filename} (${dto.content.length} chars)`);

    const text = dto.content;
    const chunks = this.chunkingService.splitByPages(text, dto.filename);

    if (!chunks || chunks.length === 0) {
      this.logger.warn(`[RAG] Chunking failed or returned empty result for ${dto.filename}`);
      throw new InternalServerErrorException('텍스트 처리 실패 (Chunking Failed)');
    }

    this.logger.log(`[RAG] Created ${chunks.length} chunks. Processing...`);

    let storedCount = 0;
    const totalBatches = Math.ceil(chunks.length / this.BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * this.BATCH_SIZE;
      const end = Math.min(start + this.BATCH_SIZE, chunks.length);
      const batch = chunks.slice(start, end);

      this.logger.log(`[RAG] Processing Batch ${batchIndex + 1}/${totalBatches}`);

      const batchResults = await Promise.all(
        batch.map(async (chunk, idx) => {
          try {
            // 1. 임베딩 생성 시도
            const embedding = await this.embeddingService.generateEmbedding(chunk.content);

            // 2. 데이터 포맷팅
            const vectorString = `[${embedding.join(',')}]`;

            // 작은 따옴표 이스케이프 처리 (SQL Injection 방지 및 문법 오류 방지)
            const safeContent = chunk.content.replace(/'/g, "''");
            const safeMetadata = JSON.stringify(chunk.metadata).replace(/'/g, "''");

            // 3. Raw Query 실행 (Unsafe 사용으로 벡터 변환 오류 원천 차단)
            await this.prisma.$executeRawUnsafe(`
              INSERT INTO "document_sections" ("content", "metadata", "embedding", "created_at", "updated_at")
              VALUES (
                '${safeContent}',
                '${safeMetadata}'::jsonb,
                '${vectorString}'::vector,
                NOW(),
                NOW()
              )
            `);
            return true;
          } catch (error) {
            // 에러 로그를 상세하게 찍어서 Railway 로그에서 확인 가능하게 함
            this.logger.error(`[RAG] Failed at Chunk ${start + idx}. Cause: ${error.message}`);
            if (error instanceof Error) {
              this.logger.error(error.stack);
            }
            return false;
          }
        }),
      );

      storedCount += batchResults.filter((r) => r).length;
      // API Rate Limit 방지를 위한 지연
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.logger.log(`[RAG] Ingest Complete. Stored ${storedCount}/${chunks.length}`);
    return storedCount;
  }

  async searchSimilar(query: string, topK = 3): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    // [수정 3] 검색 쿼리에서도 동일하게 포맷팅 적용
    const vectorString = `[${queryEmbedding.join(',')}]`;

    // cosine distance 연산자 (<=>) 사용
    const results = await this.prisma.$queryRaw<SearchResult[]>`
      SELECT 
        content,
        metadata,
        1 - (embedding <=> ${vectorString}::vector) AS similarity
      FROM document_sections
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${topK}
    `;

    return results;
  }

  async askQuestion(question: string): Promise<RagResponse> {
    this.logger.log(`Processing question: ${question}`);

    const relevantDocs = await this.searchSimilar(question, 4);

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

    const prompt = `당신은 학교 행정 업무를 지원하는 AI 어시스턴트입니다. 
다음 제공된 [참고 문서]만을 바탕으로 [질문]에 대해 답변해주세요.

## 지침
1. **사실 기반:** 문서에 없는 내용은 지어내지 말고 "문서에서 정보를 찾을 수 없습니다"라고 하세요.
2. **출처 명시:** 답변 중간이나 끝에 인용한 정보의 출처 번호(예: [출처 1])를 표기하세요.
3. **어조:** 한국 학교 행정가들에게 적합한 정중하고 전문적인 어조(해요체)를 사용하세요.

## 참고 문서
${context}

## 질문
${question}

## 답변`;

    try {
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
    } catch (error) {
      this.logger.error('Gemini Generate Error:', error);
      throw new InternalServerErrorException('답변 생성 중 오류가 발생했습니다.');
    }
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

    // BigInt 처리 (JSON 직렬화 문제 방지)
    const count = countResult[0]?.count ? Number(countResult[0].count) : 0;

    return {
      totalChunks: count,
      sources: sourcesResult.map((r) => r.source),
    };
  }

  async clearDocuments(): Promise<void> {
    await this.prisma.$executeRaw`DELETE FROM document_sections`;
    this.logger.log('All document sections cleared');
  }
}
