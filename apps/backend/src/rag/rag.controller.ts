import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { RagService } from './rag.service';
import { IngestTextDto } from './dto/ingest-text.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) { }

  @Post('upload')
  async uploadDocument(@Body() dto: IngestTextDto) {
    // 그냥 기다렸다가 결과 받으세요. 짧은 텍스트는 3초 안에 끝납니다.
    const count = await this.ragService.ingestDocument(dto);
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
