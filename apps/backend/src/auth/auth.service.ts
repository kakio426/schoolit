import { Injectable } from '@nestjs/common';
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
    const { email, name, snsId, phone } = profile;
    return this.userService.findOrCreateSocialUser(email, name, provider, snsId, phone);
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

  async requestPhoneVerification(userId: number, phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Re-use verification code storage (or specify phone version if needed)
    // For simplicity, we use the same verification code field but prefix it
    await this.userService.saveVerificationCode(userId, `PHONE|${code}`, phone);
    await this.smsService.sendVerificationCode(phone, code);
    return { sent: true, phone };
  }

  async verifyPhone(userId: number, code: string) {
    const { valid, email: phone } = await this.userService.validateVerificationCode(userId, `PHONE|${code}`);
    if (!valid) return { success: false };

    // Update user phone number
    await this.userService.updateProfile(userId, { phone });

    return { success: true };
  }

  async finishSignup(userId: number, data: { role: Role; name: string; phone: string; profileData?: any }) {
    console.log(`[FinishSignup] Starting for user ${userId} with role ${data.role}`);
    try {
      // 1. Update Name and Phone
      console.log(`[FinishSignup] Updating name and phone...`);
      await this.userService.updateProfile(userId, { name: data.name, phone: data.phone });

      // 2. Update Role and create specific profile
      console.log(`[FinishSignup] Updating role to ${data.role}...`);
      await this.userService.updateRole(userId, data.role);

      // 3. Update specific profile data if exists
      if (data.profileData) {
        console.log(`[FinishSignup] Updating specific profile data...`);
        if (data.role === Role.TEACHER) {
          await this.userService.updateProfile(userId, data.profileData);
        } else if (data.role === Role.SCHOOL) {
          await this.userService.updateSchoolProfile(userId, data.profileData);
        } else if (data.role === Role.BUSINESS) {
          // Business Profile update logic
          await this.userService.updateRole(userId, Role.BUSINESS); // Role update logic handles profile creation
        }
      }

      // Return new token because role changed
      console.log(`[FinishSignup] Generating new token for user ${userId}...`);
      const updatedUser = await this.userService.findById(userId);
      if (!updatedUser) {
        throw new Error('Updated user not found');
      }
      return this.login(updatedUser);
    } catch (error) {
      console.error(`[FinishSignup] Error during signup completion:`, error);
      throw error;
    }
  }
}
