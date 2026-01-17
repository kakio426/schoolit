import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { PrismaModule } from '../prisma.module';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';
import { GeminiPdfService } from './gemini-pdf.service';

// Ensure upload directory exists in system temp (Safe for Read-only FS & Windows)
const uploadDir = path.join(os.tmpdir(), 'schoolit-uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create temp upload directory:', error);
}

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    MulterModule.register({
      dest: uploadDir,
    }),
  ],
  controllers: [RagController],
  providers: [RagService, EmbeddingService, ChunkingService, GeminiPdfService],
  exports: [RagService],
})
export class RagModule { }
