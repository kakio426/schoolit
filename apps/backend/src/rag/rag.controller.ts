import { Controller, Post, Body, Logger, InternalServerErrorException } from '@nestjs/common';
import { RagService } from './rag.service';
import { IngestTextDto } from './dto/ingest-text.dto';

@Controller('rag')
export class RagController {
  private readonly logger = new Logger(RagController.name);

  constructor(private readonly ragService: RagService) { }

  @Post('upload')
  async uploadDocument(@Body() dto: IngestTextDto) {
    // 1. 내용 검증
    if (!dto.content || dto.content.trim().length === 0) {
      throw new InternalServerErrorException('문서 내용이 비어있습니다.');
    }

    this.logger.log(`[RAG] Text received: ${dto.filename} (${dto.content.length} chars)`);

    // 2. 서비스 호출
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
}
