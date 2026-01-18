import { Controller, Post, Get, Body, Logger, InternalServerErrorException } from '@nestjs/common';
import { RagService } from './rag.service';
import { IngestTextDto } from './dto/ingest-text.dto';

@Controller('rag')
export class RagController {
  private readonly logger = new Logger(RagController.name);

  constructor(private readonly ragService: RagService) { }

  // [수정 1] 비동기 처리: 502 타임아웃 방지
  @Post('upload')
  async uploadDocument(@Body() dto: IngestTextDto) {
    if (!dto.content || dto.content.trim().length === 0) {
      throw new InternalServerErrorException('문서 내용이 비어있습니다.');
    }

    this.logger.log(`[RAG] Upload request received. Size: ${dto.content.length} chars. processing in background...`);

    // 핵심: await를 쓰지 않고 작업을 시작만 시킵니다. (Fire-and-Forget)
    // 에러가 나도 서버가 죽지 않도록 catch만 달아둡니다.
    this.ragService.ingestDocument(dto).catch(err => {
      this.logger.error(`[RAG] Background processing failed: ${err.message}`, err.stack);
    });

    // 즉시 성공 응답을 보냅니다.
    return {
      success: true,
      message: '문서 처리를 시작했습니다. 완료까지 시간이 조금 걸릴 수 있습니다.'
    };
  }

  // [수정 2] 제가 빼먹었던 통계 API 복구 (404 해결)
  @Get('stats')
  async getStats() {
    try {
      return await this.ragService.getStats();
    } catch (error) {
      this.logger.error('Failed to get stats', error);
      // DB가 아직 준비 안 되었을 때를 대비해 기본값 반환
      return { totalChunks: 0, sources: [] };
    }
  }

  @Post('ask')
  async askQuestion(@Body() body: { question: string }) {
    return this.ragService.askQuestion(body.question);
  }
}
