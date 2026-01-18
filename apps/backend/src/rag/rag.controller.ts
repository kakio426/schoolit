import { Controller, Post, Body, Logger, InternalServerErrorException, Get, Delete } from '@nestjs/common';
import { RagService } from './rag.service';
import { IngestTextDto } from './dto/ingest-text.dto';

@Controller('rag')
export class RagController {
  private readonly logger = new Logger(RagController.name);

  constructor(private readonly ragService: RagService) { }

  @Post('upload')
  async uploadDocument(@Body() dto: IngestTextDto) {
    // 텍스트 내용 검증
    if (!dto.content || dto.content.trim().length === 0) {
      throw new InternalServerErrorException('문서 내용이 비어있습니다.');
    }

    this.logger.log(`[RAG] Text received. Length: ${dto.content.length}`);

    const storedCount = await this.ragService.ingestDocument(dto);

    return {
      success: true,
      chunks: storedCount,
      message: `성공적으로 ${storedCount}개의 지식 조각이 저장되었습니다.`
    };
  }

  @Post('ask')
  async askQuestion(@Body() body: { question: string }) {
    return this.ragService.askQuestion(body.question);
  }

  // 기존 유용한 엔드포인트 유지
  @Get('stats')
  async getStats() {
    return this.ragService.getStats();
  }

  @Delete('documents')
  async clearDocuments() {
    await this.ragService.clearDocuments();
    return { message: '모든 문서가 삭제되었습니다.' };
  }
}
