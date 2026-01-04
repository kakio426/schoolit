import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { CertificationService } from './certification.service';
import { UserController } from './users.controller';

@Module({
  controllers: [UserController],
  providers: [UserService, CertificationService],
  exports: [UserService, CertificationService],
})
export class UsersModule {}
