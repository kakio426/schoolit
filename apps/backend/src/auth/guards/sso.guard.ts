import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SSOGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.body.sso_token || request.query.sso_token; // Support both for transition, prefer body

    // SSO 토큰이 없으면 즉시 예외 발생 (필수)
    if (!token) {
      throw new UnauthorizedException('SSO token is missing');
    }

    try {
      // token을 문자열로 변환하여 타입 안정성 확보
      const tokenString = token.toString();

      // HS256 알고리즘으로 JWT 검증
      const payload = await this.jwtService.verifyAsync(tokenString, {
        secret: this.configService.get('SSO_JWT_SECRET'),
        algorithms: ['HS256'],
      });

      // 검증된 페이로드를 요청 객체에 저장
      // payload: { sub, username, email, name, role }
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid SSO Token');
    }
  }
}
