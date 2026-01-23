import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { NaverStrategy } from './strategies/naver.strategy';
import { EmailService } from '../email/email.service';
import { SmsModule } from '../sms/sms.module';
import { SSOGuard } from './guards/sso.guard';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    SmsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, KakaoStrategy, NaverStrategy, EmailService, SSOGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, SSOGuard],
})
export class AuthModule {}
