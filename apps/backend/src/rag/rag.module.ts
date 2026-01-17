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

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
  ],
  controllers: [RagController],
  providers: [RagService, EmbeddingService, ChunkingService],
  exports: [RagService],
})
export class RagModule { }
