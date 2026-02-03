import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Res,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { SSOGuard } from './guards/sso.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // --- Kakao ---
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {
    // Passport가 카카오 로그인 페이지로 리다이렉트합니다.
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallback(@Request() req, @Res() res: Response) {
    const { accessToken } = await this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }

  // --- Naver ---
  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverLogin() {
    // Passport가 네이버 로그인 페이지로 리다이렉트합니다.
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverCallback(@Request() req, @Res() res: Response) {
    const { accessToken } = await this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }

  // --- SSO (eduitit) ---
  @Get('sso')
  @UseGuards(SSOGuard)
  async ssoCallback(@Request() req) {
    if (!req.user) {
      throw new BadRequestException('Invalid SSO token');
    }

    // SSO 토큰의 사용자 정보(sub, username, email, name, role)를 바탕으로 유저 찾기 또는 생성
    const user = await this.authService.findOrCreateSSOUser(req.user);

    // 유저 인증 토큰 발급
    const { accessToken } = await this.authService.login(user);

    // 역할에 따른 리다이렉트 경로 결정
    const roleRedirectMap: Record<string, string> = {
      SCHOOL: '/school/dashboard',
      INSTRUCTOR: '/instructor/jobs',
      COMPANY: '/company/events',
      APPLICANT: '/applicant/dashboard',
      ADMIN: '/admin/dashboard',
    };

    const schoolitDomain = process.env.SCHOOLIT_DOMAIN || 'schoolit.shop';
    const redirectPath = roleRedirectMap[user.role] || '/dashboard';
    const redirectUrl = `https://${schoolitDomain}${redirectPath}?token=${accessToken}`;

    // 프론트엔드로 리다이렉트 (토큰 포함)
    return { accessToken, redirectUrl, role: user.role };
  }

  @Get('test-login')
  async testLogin(
    @Request() req,
    @Body() body,
    @Query('email') email?: string,
    @Query('role') role?: string,
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }
    return this.authService.testLogin({ email, role });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('refresh-token')
  async refreshToken(@Request() req) {
    // Fetch fresh user data to include updated roles/status in the new token
    const user = await this.authService.getUserById(req.user.userId);
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('email/request')
  async requestEmailVerification(@Request() req, @Body('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');

    // Regex for official domains (korea.kr, go.kr, sen.go.kr, .hs.kr, .ms.kr, .es.kr, .ac.kr)
    // Matches: @korea.kr, @*.korea.kr, @go.kr, @*.go.kr
    // Matches: @*.hs.kr, @*.ms.kr, @*.es.kr, @*.kg.kr (Kyonggi), etc.
    const officialDomainRegex =
      /@([a-zA-Z0-9-]+\.)*(korea\.kr|go\.kr|hs\.kr|ms\.kr|es\.kr|ac\.kr|kg\.kr|sen\.go\.kr)$/i;

    // Additional specific allowed domains if needed
    const isAllowed = officialDomainRegex.test(email);

    if (!isAllowed) {
      throw new BadRequestException(
        '공직자/기관/학교 공식 이메일(@korea.kr, @go.kr, @hs.kr 등)만 사용 가능합니다.',
      );
    }

    return this.authService.requestEmailVerification(req.user.userId, email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('email/verify')
  async verifyEmail(
    @Request() req,
    @Body() body: { code: string; schoolName?: string; phoneNumber?: string },
  ) {
    if (!body.code) throw new BadRequestException('Code is required');

    let schoolData;
    if (body.schoolName) {
      schoolData = {
        schoolName: body.schoolName,
        phoneNumber: body.phoneNumber || null,
      };
    }

    return this.authService.verifyEmail(req.user.userId, body.code, schoolData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('phone/request')
  async requestPhoneVerification(@Request() req, @Body('phone') phone: string) {
    if (!phone) throw new BadRequestException('Phone number is required');
    return this.authService.requestPhoneVerification(req.user.userId, phone);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('phone/verify')
  async verifyPhone(@Request() req, @Body('code') code: string) {
    if (!code) throw new BadRequestException('Code is required');
    return this.authService.verifyPhone(req.user.userId, code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('social/finish-signup')
  async finishSignup(@Request() req, @Body() body: any) {
    console.log('[AuthController] finishSignup called with body:', JSON.stringify(body));
    try {
      const result = await this.authService.finishSignup(req.user.userId, body);
      console.log('[AuthController] finishSignup succeeded');
      return result;
    } catch (error) {
      console.error('[AuthController] finishSignup error:', error);
      throw error;
    }
  }
}
