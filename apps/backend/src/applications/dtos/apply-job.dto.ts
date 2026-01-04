import { IsString, IsOptional } from 'class-validator';

export class ApplyJobDto {
  @IsString()
  @IsOptional()
  message?: string;
}
