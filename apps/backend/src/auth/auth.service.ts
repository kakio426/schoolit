import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { Provider } from '@prisma/client';

import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const result = { ...user };
      delete result.password;
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
    const { email, name, snsId } = profile;
    return this.userService.findOrCreateSocialUser(email, name, provider, snsId);
  }

  async signup(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    const result = { ...user };
    delete result.password;
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
      } as any);
    }

    return {
      ...(await this.login(user)),
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
  async requestEmailVerification(userId: number, email: string) {
    // 1. Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // 2. Save code with email
    await this.userService.saveVerificationCode(userId, code, email);
    // 3. Send Email
    await this.emailService.sendVerificationCode(email, code);
    return { sent: true, email };
  }

  async verifyEmail(userId: number, code: string, schoolData?: { schoolName: string; phoneNumber: string }) {
    const { valid, email } = await this.userService.validateVerificationCode(userId, code);
    if (!valid) return { success: false };

    // Update School Profile if data provided
    if (schoolData) {
      await this.userService.updateSchoolProfile(userId, {
        schoolName: schoolData.schoolName,
        phoneNumber: schoolData.phoneNumber,
        description: email ? `[Verified Email: ${email}]` : undefined,
      });
    }

    return { success: true };
  }
}
