import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DataCleanupService } from './data-cleanup.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [DataCleanupService],
  exports: [DataCleanupService],
})
export class SchedulerModule {}
