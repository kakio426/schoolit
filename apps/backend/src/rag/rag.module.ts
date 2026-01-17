import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs';
import { PrismaModule } from '../prisma.module';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';
import { GeminiPdfService } from './gemini-pdf.service';

// Ensure upload directory exists
const uploadDir = './uploads/temp';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    MulterModule.register({
      dest: './uploads/temp',
    }),
  ],
  controllers: [RagController],
  providers: [RagService, EmbeddingService, ChunkingService, GeminiPdfService],
  exports: [RagService],
})
export class RagModule { }
