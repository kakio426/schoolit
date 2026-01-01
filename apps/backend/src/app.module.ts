
import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma.module';

@Module({
    imports: [
        PrismaModule,
        HealthModule,
        UsersModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
