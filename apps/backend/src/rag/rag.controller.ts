import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RagService, RagResponse, SearchResult } from './rag.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@Controller('rag')
@UseGuards(AuthGuard('jwt'))
export class RagController {
    constructor(private readonly ragService: RagService) { }

    /**
     * Upload and process a PDF document for RAG
     * POST /api/rag/upload
     */
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    new FileTypeValidator({ fileType: 'application/pdf' }),
                ],
            }),
        )
        file: Express.Multer.File,
    ): Promise<{ message: string; chunksCreated: number }> {
        const chunksCreated = await this.ragService.ingestDocument(file);
        return {
            message: `문서 '${file.originalname}'이(가) 성공적으로 처리되었습니다.`,
            chunksCreated,
        };
    }

    /**
     * Ask a question using RAG
     * POST /api/rag/ask
     */
    @Post('ask')
    async askQuestion(@Body() dto: AskQuestionDto): Promise<RagResponse> {
        return this.ragService.askQuestion(dto.question);
    }

    /**
     * Search similar documents
     * GET /api/rag/search?q=query&limit=3
     */
    @Get('search')
    async searchDocuments(
        @Query('q') query: string,
        @Query('limit') limit?: string,
    ): Promise<{ results: SearchResult[] }> {
        const topK = limit ? parseInt(limit, 10) : 3;
        const results = await this.ragService.searchSimilar(query, topK);
        return { results };
    }

    /**
     * Get document statistics
     * GET /api/rag/stats
     */
    @Get('stats')
    async getStats(): Promise<{ totalChunks: number; sources: string[] }> {
        return this.ragService.getStats();
    }

    /**
     * Clear all documents (admin only - add role guard if needed)
     * DELETE /api/rag/documents
     */
    @Delete('documents')
    async clearDocuments(): Promise<{ message: string }> {
        await this.ragService.clearDocuments();
        return { message: '모든 문서가 삭제되었습니다.' };
    }
}
