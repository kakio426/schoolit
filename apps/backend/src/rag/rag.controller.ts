import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RagService } from './rag.service';
import { IngestTextDto } from './dto/ingest-text.dto';

@Controller('rag')
@UseGuards(ThrottlerGuard) // Rate Limiting: 1분당 10회 제한 (AppModule에서 설정)
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('upload')
  async uploadDocument(@Body() dto: IngestTextDto) {
    const count = await this.ragService.ingestDocument(dto);
    if (count === 0) {
      return { success: true, message: '이미 학습된 문서입니다. 중복 업로드를 건너뛰었습니다.' };
    }
    return { success: true, message: `${count}개의 내용이 저장되었습니다.` };
  }

  @Get('stats')
  async getStats() {
    return this.ragService.getStats();
  }

  @Post('ask')
  async askQuestion(@Body() body: { question: string }) {
    return this.ragService.askQuestion(body.question);
  }

  @Get('sections')
  async listSections() {
    return this.ragService.listSections();
  }

  @Delete('sections/:id')
  async deleteSection(@Param('id') id: string) {
    return this.ragService.deleteSection(parseInt(id, 10));
  }

  @Delete('documents')
  async deleteAllDocuments() {
    return this.ragService.deleteAllSections();
  }
}
