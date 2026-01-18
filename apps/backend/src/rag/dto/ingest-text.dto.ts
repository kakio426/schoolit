import { IsString, IsOptional, IsObject } from 'class-validator';

export class IngestTextDto {
  @IsString()
  content: string;

  @IsString()
  filename: string;

  // 👇 이 부분이 핵심입니다. 이게 있어야 metadata를 받을 수 있습니다.
  @IsOptional()
  // @IsObject() // 혹시 class-validator 에러가 나면 이 줄은 주석 처리하세요.
  metadata?: Record<string, any>;
}
