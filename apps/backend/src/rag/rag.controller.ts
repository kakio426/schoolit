import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { RagService } from './rag.service';
import { IngestTextDto } from './dto/ingest-text.dto';

@Controller('rag')
@UseGuards(ThrottlerGuard, AuthGuard('jwt')) // Rate Limiting & Authentication
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
  async askQuestion(@Request() req, @Body() body: { question: string }) {
    // req.user.role을 통해 유저의 역할 정보를 서비스로 전달
    return this.ragService.askQuestion(body.question, req.user?.role);
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
