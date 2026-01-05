import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';

export class CreateTeacherExperienceDto {
    @IsString()
    title: string;

    @IsString()
    organization: string;

    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsBoolean()
    @IsOptional()
    isCurrent?: boolean;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CreateTeacherEducationDto {
    @IsString()
    schoolName: string;

    @IsString()
    degree: string;

    @IsString()
    @IsOptional()
    major?: string;

    @IsString()
    @IsOptional()
    graduationStatus?: string; // GRADUATED, ATTENDING

    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class CreateTeacherLinkDto {
    @IsString()
    title: string;

    @IsString()
    url: string;
}
