import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { Provider, Role } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(email);

    if (user && (user as any).isDeleted) {
      return { isDeleted: true, message: '탈퇴한 계정입니다.' };
    }

    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateSocialUser(profile: any, provider: Provider): Promise<any> {
    const { email, name, snsId, phone } = profile;
    return this.userService.findOrCreateSocialUser(email, name, provider, snsId, phone);
  }

  async signup(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async testLogin(options?: { email?: string; role?: string }) {
    const testEmail = options?.email || 'test@school.com';
    let user = await this.userService.findOne(testEmail);

    if (!user) {
      user = await this.userService.create({
        email: testEmail,
        name: '테스트 사용자',
        role: (options?.role as any) || 'TEACHER',
      });
    }

    return {
      ...(await this.login(user)),
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async requestEmailVerification(userId: number, email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.userService.saveVerificationCode(userId, code, email);
    await this.emailService.sendVerificationCode(email, code);
    return { sent: true, email };
  }

  async verifyEmail(
    userId: number,
    code: string,
    schoolData?: { schoolName: string; phoneNumber?: string | null },
  ) {
    const { valid, email } = await this.userService.validateVerificationCode(userId, code);
    if (!valid) return { success: false };

    // Update School Profile if data provided
    if (schoolData) {
      const isTrustedEmail = email?.endsWith('.kr') || email?.endsWith('.go.kr');

      await this.userService.updateSchoolProfile(userId, {
        schoolName: schoolData.schoolName,
        phoneNumber: schoolData.phoneNumber,
        description: email ? `[Verified Email: ${email}]` : undefined,
        isVerified: !!isTrustedEmail,
      });
    }

    const updatedUser = await this.userService.findById(userId);
    const tokenData = await this.login(updatedUser);

    return {
      success: true,
      ...tokenData,
    };
  }

  async requestPhoneVerification(userId: number, phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.userService.saveVerificationCode(userId, `PHONE|${code}`, phone);
    await this.smsService.sendVerificationCode(phone, code);
    return { sent: true, phone };
  }

  async verifyPhone(userId: number, code: string) {
    const { valid, email: phone } = await this.userService.validateVerificationCode(
      userId,
      `PHONE|${code}`,
    );
    if (!valid) return { success: false };

    await this.userService.updateProfile(userId, { phone });
    return { success: true };
  }

  async finishSignup(
    userId: number,
    data: { role: Role; name: string; phone: string; profileData?: any },
  ) {
    try {
      // Use atomic transaction for signup completion
      const updatedUser = await this.userService.completeSignupTransaction(userId, data);

      if (!updatedUser) {
        throw new InternalServerErrorException('Failed to complete signup');
      }

      // Return new token because role has changed
      return this.login(updatedUser);
    } catch (error) {
      console.error(`[FinishSignup] Error:`, error);
      throw error;
    }
  }
  async getUserById(userId: number) {
    return this.userService.findById(userId);
  }

  async findOrCreateSSOUser(ssoPayload: any) {
    // Eduitit SSO 토큰 페이로드에서 필드 추출
    // 필수 필드: sub, username, email, name, role
    const { sub, username, email, name, role } = ssoPayload;

    // email 또는 username으로 기존 사용자 조회
    const searchIdentifier = email || username;
    if (!searchIdentifier) {
      throw new Error('Email or username must be provided in SSO payload');
    }

    let user = await this.userService.findOne(searchIdentifier);

    if (!user) {
      // 새 사용자 생성
      // email은 필수, name이 없으면 username 사용
      const createUserDto = {
        email: email || username,
        name: name || username || `User_${sub}`,
        role: (role as any) || 'APPLICANT', // SCHOOL, INSTRUCTOR, COMPANY, APPLICANT 등
        password: '', // SSO 사용자는 비밀번호 없음
      };

      user = await this.userService.create(createUserDto);
    } else {
      // 기존 사용자의 역할이 SSO 토큰의 역할과 다르면 업데이트
      if (role && user.role !== role) {
        // Prisma를 사용하여 직접 User 업데이트
        user = await this.userService.updateUserRole(user.id, role as any);
      }
    }

    return user;
  }
}
