import { Module } from '@nestjs/common';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { PrismaModule } from '../prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}
