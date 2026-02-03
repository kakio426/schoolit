import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NaraIliterClient } from './nara-iliter.client';
import { WorknetClient } from './worknet.client';
import { ScraperService } from './scraper/scraper.service';
import { AiParserService } from './ai-parser/ai-parser.service';
import { SyncWorker } from './sync/sync.worker';

@Module({
  imports: [ConfigModule],
  providers: [NaraIliterClient, WorknetClient, ScraperService, AiParserService, SyncWorker],
  exports: [NaraIliterClient, WorknetClient, ScraperService, AiParserService, SyncWorker],
})
export class ExternalJobsModule { }
