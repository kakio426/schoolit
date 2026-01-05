import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  ValidateIf,
} from 'class-validator';

export enum JobType {
  TEACHER_HIRING = 'TEACHER_HIRING',
  EVENT_VENDOR = 'EVENT_VENDOR',
}

export class CreateJobDto {
  @IsEnum(JobType)
  jobType: JobType;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsArray()
  @IsString({ each: true })
  subjects: string[];

  @IsArray()
  @IsString({ each: true })
  regions: string[];

  // Teacher-specific fields
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.jobType === JobType.TEACHER_HIRING)
  contractPeriod?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ValidateIf((o) => o.jobType === JobType.TEACHER_HIRING)
  gradeLevel?: string[];

  @IsNumber()
  @IsOptional()
  @ValidateIf((o) => o.jobType === JobType.TEACHER_HIRING)
  teachingHours?: number;

  // Event-specific fields
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.jobType === JobType.EVENT_VENDOR)
  eventType?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.jobType === JobType.EVENT_VENDOR)
  eventDuration?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.jobType === JobType.EVENT_VENDOR)
  participantCount?: string;

  @IsBoolean()
  @IsOptional()
  @ValidateIf((o) => o.jobType === JobType.EVENT_VENDOR)
  equipmentProvided?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ValidateIf((o) => o.jobType === JobType.EVENT_VENDOR)
  certifications?: string[];

  @IsOptional()
  internalChecklist?: any;
}

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  subjects?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  regions?: string[];

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsOptional()
  internalChecklist?: any;
}
