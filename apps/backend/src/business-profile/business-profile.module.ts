import { Module } from '@nestjs/common';
import { BusinessProfileController } from './business-profile.controller';
import { BusinessProfileService } from './business-profile.service';
import { PrismaService } from '../prisma.service';

import { StorageModule } from '../common/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [BusinessProfileController],
  providers: [BusinessProfileService, PrismaService],
  exports: [BusinessProfileService],
})
export class BusinessProfileModule { }
