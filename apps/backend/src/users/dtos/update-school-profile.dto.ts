import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateSchoolProfileDto {
    @IsString()
    @IsOptional()
    schoolName?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsUrl()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
