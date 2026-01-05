import { IsString, IsOptional, IsUrl, IsArray, IsNumber } from 'class-validator';

export class UpdateSchoolProfileDto {
  @IsString()
  @IsOptional()
  schoolName?: string;

  @IsString()
  @IsOptional()
  schoolType?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  detailAddress?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  homepage?: string; // Website alias

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  studentCount?: number;

  @IsString()
  @IsOptional()
  logoImage?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
