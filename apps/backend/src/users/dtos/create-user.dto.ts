import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role, Provider } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Role)
  role: Role;

  @IsEnum(Provider)
  @IsOptional()
  provider?: Provider;

  @IsString()
  @IsOptional()
  snsId?: string;
}
