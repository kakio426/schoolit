import { Injectable, Logger, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma.service';
import { IngestTextDto } from './dto/ingest-text.dto';

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
      this.chatModel = this.genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });
      this.embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
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

  // 👇 여기가 핵심입니다. 복잡한 로직 다 버리고 문자열 길이로만 자릅니다.
  async ingestDocument(dto: IngestTextDto): Promise<number> {
    const { content, filename, metadata } = dto;

    this.logger.log(`[RAG] Processing text: ${filename} (${content.length} chars)`);

    // 1. 단순 무식하게 500자 단위로 자르기 (절대 에러 안 남)
    const chunks = content.match(/.{1,500}/g) || [content];
    this.logger.log(`[RAG] Split into ${chunks.length} chunks`);

    let successCount = 0;

    // 2. 각 조각을 순서대로 저장
    for (let i = 0; i < chunks.length; i++) {
      try {
        const chunkText = chunks[i];

        // 임베딩 생성
        const result = await this.embeddingModel.embedContent(chunkText);
        const embedding = result.embedding.values;
        const vectorString = `[${embedding.join(',')}]`;

        // DB 저장 (특수문자 이스케이프 처리)
        const safeContent = chunkText.replace(/'/g, "''");
        const safeMeta = JSON.stringify({
          ...metadata,
          chunkIndex: i,
          source: filename || 'manual_text'
        }).replace(/'/g, "''");

        await this.prisma.$executeRawUnsafe(`
          INSERT INTO "document_sections" ("content", "metadata", "embedding", "created_at", "updated_at")
          VALUES ('${safeContent}', '${safeMeta}'::jsonb, '${vectorString}'::vector, NOW(), NOW())
        `);

        successCount++;
        // API 속도 제한 방지 (0.2초 대기)
        await new Promise(r => setTimeout(r, 200));

      } catch (error) {
        this.logger.error(`[RAG] Failed chunk ${i}: ${error.message}`);
        // 하나 실패해도 멈추지 않고 다음 거 진행
      }
    }

    return successCount;
  }

  async searchSimilar(query: string, topK = 4): Promise<SearchResult[]> {
    const result = await this.embeddingModel.embedContent(query);
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

    const context = docs.map((d, i) => `[문서 ${i + 1}] ${d.content}`).join('\n\n');
    const prompt = `다음 문서를 바탕으로 질문에 답하세요.\n\n${context}\n\n질문: ${question}`;

    const result = await this.chatModel.generateContent(prompt);
    return { answer: result.response.text(), sources: docs.map(d => d.metadata) };
  }

  async getStats() {
    const count = await this.prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM document_sections`;
    return { totalChunks: count[0].count, sources: [] };
  }
}
