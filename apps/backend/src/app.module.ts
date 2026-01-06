import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma.module';
import { AdminModule } from './admin/admin.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MatchingModule } from './matching/matching.module';
import { ChatModule } from './chat/chat.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';

import { BusinessProfileModule } from './business-profile/business-profile.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FeedbackModule } from './feedback/feedback.module';
// StorageModule removed - using text-only approach
import { ContractsModule } from './context/contracts/contracts.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    AdminModule,
    JobsModule,
    ApplicationsModule,
    BusinessProfileModule,
    DashboardModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    MatchingModule,
    ChatModule,
    ReviewsModule,
    NotificationsModule,
    FeedbackModule,
    // StorageModule, // Removed - no file upload
    ContractsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
