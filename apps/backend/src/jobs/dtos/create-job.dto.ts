import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateJobDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsArray()
    @IsString({ each: true })
    subjects: string[];

    @IsArray()
    @IsString({ each: true })
    regions: string[];
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
}
