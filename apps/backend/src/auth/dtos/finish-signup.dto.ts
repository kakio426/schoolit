import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class FinishSignupDto {
  @IsEnum(Role)
  role: Role;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  profileData?: any;
}
