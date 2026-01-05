import { IsString, IsOptional, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class UpdateBusinessProfileDto {
    @IsOptional()
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsString()
    registrationNum?: string;

    @IsOptional()
    @IsString()
    s2bNumber?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUrl()
    @IsString()
    website?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsBoolean()
    canIssueTaxInvoice?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categories?: string[];

    @IsOptional()
    @IsString()
    registrationFile?: string;

    @IsOptional()
    @IsString()
    bankAccount?: string;

    @IsOptional()
    checklist?: any; // Allow JSON object
}
