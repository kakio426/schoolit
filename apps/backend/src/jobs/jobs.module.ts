import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
