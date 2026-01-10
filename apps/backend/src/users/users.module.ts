import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './users.controller';
import { GamificationService } from './gamification.service';

@Module({
  controllers: [UserController],
  providers: [UserService, GamificationService],
  exports: [UserService, GamificationService],
})
export class UsersModule { }
