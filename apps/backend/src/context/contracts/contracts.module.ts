import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { PdfGeneratorService } from '../../common/pdf/pdf-generator.service';

@Module({
    imports: [],
    controllers: [ContractsController],
    providers: [PdfGeneratorService],
})
export class ContractsModule { }
