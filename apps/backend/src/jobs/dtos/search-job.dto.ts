import { IsOptional, IsString } from 'class-validator';

export class SearchJobDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}
