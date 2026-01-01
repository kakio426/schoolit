import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver-v2';
import { AuthService } from '../auth.service';
import { Provider } from '@prisma/client';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_CALLBACK_URL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const { email, nickname, id } = profile;
    const user = await this.authService.validateSocialUser(
      {
        email: email,
        name: nickname,
        snsId: id,
      },
      Provider.NAVER,
    );
    done(null, user);
  }
}
