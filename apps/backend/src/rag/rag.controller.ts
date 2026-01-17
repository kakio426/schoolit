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
  BadRequestException,
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
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; chunksCreated: number }> {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    // 수동 검증: FileTypeValidator 이슈 우회
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('PDF 파일만 업로드 가능합니다.');
    }

    // 수동 검증: 50MB 제한
    if (file.size > 50 * 1024 * 1024) {
      throw new BadRequestException('파일 크기는 50MB를 초과할 수 없습니다.');
    }

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
