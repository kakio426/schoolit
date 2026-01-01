import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Provider } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const { password, ...rest } = data;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
      },
    });
  }

  async findOne(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserBySnsId(provider: Provider, snsId: string) {
    return this.prisma.user.findUnique({
      where: {
        provider_snsId: {
          provider,
          snsId,
        },
      },
    });
  }

  async findOrCreateSocialUser(email: string, name: string, provider: Provider, snsId: string) {
    let user = await this.findUserBySnsId(provider, snsId);

    if (!user) {
      user = await this.create({
        email,
        name,
        role: 'TEACHER', // Default role
        provider,
        snsId,
      } as any);
    }

    return user;
  }
}
