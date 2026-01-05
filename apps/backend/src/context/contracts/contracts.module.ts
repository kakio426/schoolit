import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { PdfGeneratorService } from '../../common/pdf/pdf-generator.service';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
    imports: [StorageModule],
    controllers: [ContractsController],
    providers: [PdfGeneratorService],
})
export class ContractsModule { }
