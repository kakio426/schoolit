import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SSOGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.query.sso_token;

    if (!token) return true; // SSO 토큰이 없으면 일반 인증 흐름으로

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('SSO_JWT_SECRET'),
      });
      
      // 토큰 정보를 바탕으로 유저 세션 생성 로직
      // payload.username, payload.role 등을 사용
      request['user'] = payload; 
      return true;
    } catch {
      throw new UnauthorizedException('Invalid SSO Token');
    }
  }
}
