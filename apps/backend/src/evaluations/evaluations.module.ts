import { Module } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { PrismaService } from '../prisma.service';

import { EvaluationsController } from './evaluations.controller';

@Module({
    controllers: [EvaluationsController],
    providers: [EvaluationsService, PrismaService],
    exports: [EvaluationsService],
})
export class EvaluationsModule { }
