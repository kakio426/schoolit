import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class EmbeddingService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: 'text-embedding-004',
        });
    }

    /**
     * Generate embedding vector for a single text
     * @param text - Text to embed
     * @returns 768-dimensional embedding vector
     */
    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const result = await this.model.embedContent(text);
            return result.embedding.values;
        } catch (error) {
            console.error('Embedding generation failed:', error);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }

    /**
     * Generate embeddings for multiple texts in batch
     * @param texts - Array of texts to embed
     * @returns Array of 768-dimensional embedding vectors
     */
    async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
        const results = await Promise.all(
            texts.map((text) => this.generateEmbedding(text)),
        );
        return results;
    }
}
