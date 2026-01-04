import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { Provider } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

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
}
