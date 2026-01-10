import { Controller, Post, Body, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DocumentsService, HiringDocumentData, ContractDocumentData } from './documents.service';

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  /**
   * 채용계획서 PDF 생성 및 다이렉트 스트리밍 다운로드
   * POST /documents/generate/hiring-plan
   */
  @Post('generate/hiring-plan')
  @UseGuards(RolesGuard)
  @Roles(Role.SCHOOL, Role.ADMIN)
  async generateHiringPlan(@Body() data: any, @Request() req, @Res() res: Response) {
    // 추가 보안: 작성자 이름이 없으면 유저 이름으로 설정
    if (!data.authorName) data.authorName = req.user.name;

    const pdfBuffer = await this.documentsService.generateHiringPlanPdf(data);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="hiring_plan_${Date.now()}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  /**
   * 채용 공문 생성 (학교 전용)
   * POST /documents/hiring
   */
  @Post('hiring')
  @UseGuards(RolesGuard)
  @Roles(Role.SCHOOL, Role.ADMIN)
  async generateHiringDocument(@Request() req, @Body() data: HiringDocumentData) {
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
  async generateContractDocument(@Request() req, @Body() data: ContractDocumentData) {
    const content = await this.documentsService.generateContractDocument(data);
    return {
      success: true,
      content,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.userId,
    };
  }

  /**
   * 채용계획서 PDF 생성 및 다운로드
   * POST /documents/hiring-plan/pdf
   */
  @Post('hiring-plan/pdf')
  @UseGuards(RolesGuard)
  @Roles(Role.SCHOOL, Role.ADMIN)
  async generateHiringPlanPdf(@Body() data: any, @Request() req) {
    // 추가 보안: 작성자 이름이 없으면 유저 이름으로 설정
    if (!data.authorName) data.authorName = req.user.name;

    const pdfBuffer = await this.documentsService.generateHiringPlanPdf(data);

    return {
      success: true,
      pdfBase64: pdfBuffer.toString('base64'),
      fileName: `채용계획서_${data.subject || '공통'}_${new Date().getTime()}.pdf`,
    };
  }
}
