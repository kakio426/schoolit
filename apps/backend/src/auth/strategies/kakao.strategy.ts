import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthService } from '../auth.service';
import { Provider } from '@prisma/client';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: '', // 카카오는 Secret이 선택사항입니다.
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const { _json } = profile;
    const user = await this.authService.validateSocialUser(
      {
        email: _json.kakao_account.email,
        name: _json.properties.nickname,
        snsId: String(profile.id),
      },
      Provider.KAKAO,
    );
    done(null, user);
  }
}
