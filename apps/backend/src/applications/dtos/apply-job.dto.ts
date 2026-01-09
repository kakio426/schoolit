import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ApplyJobDto {
  @IsString()
  @IsOptional()
  message?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}
