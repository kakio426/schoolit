import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma.service';
import { IngestTextDto } from './dto/ingest-text.dto';

// 재시도(Retry) 헬퍼 함수: 429 에러 발생 시 잠시 후 다시 시도함
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (error.message?.includes('429') || error.message?.includes('503'))) {
      console.warn(`[Gemini API] Rate limit hit. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2); // 대기 시간 2배로 늘림 (Exponential Backoff)
    }
    throw error;
  }
}

export interface SearchResult {
  content: string;
  metadata: { source: string; page?: number; chunkIndex: number };
  similarity: number;
}

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private genAI: GoogleGenerativeAI;
  private chatModel: any;
  private embeddingModel: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);

      // [중요] 'Pro'는 무료 티어에서 limit: 0 이므로 반드시 'Flash'를 사용해야 합니다.
      this.chatModel = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
      });

      this.embeddingModel = this.genAI.getGenerativeModel({
        model: 'text-embedding-004',
      });
    }
  }

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
      this.logger.log('pgvector extension enabled');
    } catch (e) {
      this.logger.warn('Failed to enable pgvector (might be already active)');
    }
  }

  async ingestDocument(dto: IngestTextDto): Promise<number> {
    const { content, filename, metadata } = dto;
    this.logger.log(`[RAG] Processing text: ${filename} (${content.length} chars)`);

    const chunks = content.match(/.{1,1000}/g) || [content]; // 1000자로 늘림 (API 호출 횟수 절약)
    this.logger.log(`[RAG] Split into ${chunks.length} chunks`);

    let successCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      try {
        const chunkText = chunks[i];

        // 임베딩 생성 (재시도 로직 적용)
        const result = await withRetry(() => this.embeddingModel.embedContent(chunkText)) as any;

        const embedding = result.embedding.values;
        const vectorString = `[${embedding.join(',')}]`;

        const safeContent = chunkText.replace(/'/g, "''");
        const safeMeta = JSON.stringify({
          ...metadata,
          chunkIndex: i,
          source: 'manual_text',
        }).replace(/'/g, "''");

        await this.prisma.$executeRawUnsafe(`
          INSERT INTO "document_sections" ("content", "metadata", "embedding", "created_at", "updated_at")
          VALUES ('${safeContent}', '${safeMeta}'::jsonb, '${vectorString}'::vector, NOW(), NOW())
        `);

        successCount++;
        await new Promise((r) => setTimeout(r, 500)); // 0.5초 대기 (안전장치)
      } catch (error) {
        this.logger.error(`[RAG] Failed chunk ${i}: ${error.message}`);
      }
    }
    return successCount;
  }

  async searchSimilar(query: string, topK = 4): Promise<SearchResult[]> {
    // 검색어 임베딩도 재시도 로직 적용
    const result = await withRetry(() => this.embeddingModel.embedContent(query)) as any;
    const vectorString = `[${result.embedding.values.join(',')}]`;

    return this.prisma.$queryRaw<SearchResult[]>`
      SELECT content, metadata, 1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM document_sections
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${topK}
    `;
  }

  async askQuestion(question: string) {
    const docs = await this.searchSimilar(question);
    if (!docs.length) return { answer: '관련 정보를 찾을 수 없습니다.', sources: [] };

    const context = docs.map((d, i) => `[데이터 ${i + 1}] ${d.content}`).join('\n\n');

    const prompt = `당신은 학교 행정 전문가입니다. 아래 제공된 [참고 데이터]를 바탕으로 선생님의 질문에 답변해주세요.

[규칙]
1. 답변에 "문서 1", "데이터 1" 같은 출처 번호를 절대 언급하지 마십시오.
2. 마크다운 기호(**, *, #, -, > 등)를 절대 사용하지 마십시오. (순수 텍스트로만 답변)
3. 답변은 친절하고 명확하게 작성하십시오.
4. 답변 본문만 작성하십시오. (부연 설명이나 출처 표기는 제가 별도로 추가합니다.)

[참고 데이터]
${context}

질문: ${question}
답변:`;

    // [핵심] 답변 생성 시에도 재시도 로직 적용 (429 에러 방어)
    const result = (await withRetry(() => this.chatModel.generateContent(prompt))) as any;
    const answer = result.response.text().trim();

    // 완성된 답변에 출처 및 면책 조항 추가
    const finalAnswer = `${answer}\n\n해당 내용은 경기도교육청 기준의 기간제 교원 및 교육공무직 관리 실무 지침을 바탕으로 하고 있으며, AI 어시스턴트의 답변은 참고용으로만 활용하시기 바랍니다.`;

    // 출처 리스트는 UI에서 노출하지 않기 위해 빈 배열로 반환
    return { answer: finalAnswer, sources: [] };
  }

  async getStats() {
    const count = await this.prisma.$queryRaw<
      any[]
    >`SELECT COUNT(*)::int as count FROM document_sections`;
    return { totalChunks: count[0].count, sources: [] };
  }

  async listSections() {
    return this.prisma.documentSection.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async deleteSection(id: number) {
    return this.prisma.documentSection.delete({
      where: { id },
    });
  }

  async deleteAllSections() {
    return this.prisma.documentSection.deleteMany({});
  }
}
