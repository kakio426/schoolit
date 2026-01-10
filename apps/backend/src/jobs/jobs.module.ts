import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [JobsService, OptionalJwtAuthGuard],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule { }
