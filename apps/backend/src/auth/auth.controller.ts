import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
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
  async kakaoCallback(@Request() req) {
    return this.authService.login(req.user);
  }

  // --- Naver ---
  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverLogin() {
    // Passport가 네이버 로그인 페이지로 리다이렉트합니다.
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverCallback(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('test-login')
  async testLogin() {
    return this.authService.testLogin();
  }
}
