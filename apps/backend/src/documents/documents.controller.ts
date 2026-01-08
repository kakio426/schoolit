import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DocumentsService, HiringDocumentData, ContractDocumentData } from './documents.service';

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
    constructor(private documentsService: DocumentsService) { }

    /**
     * 채용 공문 생성 (학교 전용)
     * POST /documents/hiring
     */
    @Post('hiring')
    @UseGuards(RolesGuard)
    @Roles(Role.SCHOOL, Role.ADMIN)
    async generateHiringDocument(
        @Request() req,
        @Body() data: HiringDocumentData,
    ) {
        const content = await this.documentsService.generateHiringDocument(data);
        return {
            success: true,
            content,
            generatedAt: new Date().toISOString(),
            generatedBy: req.user.userId,
        };
    }

    /**
     * 계약 공문 생성 (학교/교사 전용)
     * POST /documents/contract
     */
    @Post('contract')
    @UseGuards(RolesGuard)
    @Roles(Role.SCHOOL, Role.TEACHER, Role.ADMIN)
    async generateContractDocument(
        @Request() req,
        @Body() data: ContractDocumentData,
    ) {
        const content = await this.documentsService.generateContractDocument(data);
        return {
            success: true,
            content,
            generatedAt: new Date().toISOString(),
            generatedBy: req.user.userId,
        };
    }
}
