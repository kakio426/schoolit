import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService, DocumentChunk } from './chunking.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

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
export class RagService {
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
                model: 'gemini-1.5-flash',
            });
        }
    }

    /**
     * Ingest a PDF document into the vector database
     * @param file - Uploaded PDF file
     * @returns Number of chunks created
     */
    async ingestDocument(file: Express.Multer.File): Promise<number> {
        this.logger.log(`Ingesting document: ${file.originalname}`);

        // 1. Parse PDF
        const pdfData = await pdfParse(file.buffer);
        const text = pdfData.text;

        this.logger.log(
            `Extracted ${text.length} characters from ${pdfData.numpages} pages`,
        );

        // 2. Chunk the text
        const chunks = this.chunkingService.splitByPages(text, file.originalname);
        this.logger.log(`Created ${chunks.length} chunks`);

        // 3. Generate embeddings and store
        let storedCount = 0;
        for (const chunk of chunks) {
            try {
                const embedding =
                    await this.embeddingService.generateEmbedding(chunk.content);

                // Store using raw SQL for vector type
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
                storedCount++;
            } catch (error) {
                this.logger.error(`Failed to store chunk ${chunk.metadata.chunkIndex}:`, error);
            }
        }

        this.logger.log(`Successfully stored ${storedCount}/${chunks.length} chunks`);
        return storedCount;
    }

    /**
     * Search for similar document sections
     * @param query - Search query text
     * @param topK - Number of results to return
     * @returns Array of similar document sections with similarity scores
     */
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

    /**
     * Ask a question and get an AI-generated answer based on relevant documents
     * @param question - User's question
     * @returns Answer with source citations
     */
    async askQuestion(question: string): Promise<RagResponse> {
        this.logger.log(`Processing question: ${question}`);

        // 1. Search for relevant documents
        const relevantDocs = await this.searchSimilar(question, 3);

        if (relevantDocs.length === 0) {
            return {
                answer:
                    '관련된 문서를 찾을 수 없습니다. 먼저 문서를 업로드해 주세요.',
                sources: [],
            };
        }

        // 2. Build context from documents
        const context = relevantDocs
            .map(
                (doc, i) =>
                    `[출처 ${i + 1}: ${doc.metadata.source}${doc.metadata.page ? `, ${doc.metadata.page}페이지` : ''}]\n${doc.content}`,
            )
            .join('\n\n---\n\n');

        // 3. Generate answer with Gemini
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

        // 4. Return answer with sources
        return {
            answer,
            sources: relevantDocs.map((doc) => ({
                source: doc.metadata.source,
                page: doc.metadata.page,
                snippet: doc.content.slice(0, 100) + '...',
            })),
        };
    }

    /**
     * Get statistics about stored documents
     */
    async getStats(): Promise<{ totalChunks: number; sources: string[] }> {
        const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM document_sections
    `;

        const sourcesResult = await this.prisma.$queryRaw<
            Array<{ source: string }>
        >`
      SELECT DISTINCT metadata->>'source' as source 
      FROM document_sections
      WHERE metadata->>'source' IS NOT NULL
    `;

        return {
            totalChunks: Number(countResult[0]?.count || 0),
            sources: sourcesResult.map((r) => r.source),
        };
    }

    /**
     * Delete all document sections (for re-ingestion)
     */
    async clearDocuments(): Promise<void> {
        await this.prisma.$executeRaw`DELETE FROM document_sections`;
        this.logger.log('All document sections cleared');
    }
}
