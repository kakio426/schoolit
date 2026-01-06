import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetGrades?: string[];

  @IsOptional()
  transientDocuments?: any;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  checklist?: any;
}
