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
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../users/dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

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

  @Get('test-login')
  async testLogin(
    @Request() req,
    @Body() body,
    @Query('email') email?: string,
    @Query('role') role?: string,
  ) {
    return this.authService.testLogin({ email, role });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }
}
