import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
// ...
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
import { StorageModule } from './common/storage/storage.module';
import { ContractsModule } from './context/contracts/contracts.module';
import { BoardModule } from './board/board.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { DocumentsModule } from './documents/documents.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ComplianceModule } from './compliance/compliance.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1분 (밀리초)
        limit: 10, // 10회 제한
      },
    ]),
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
    StorageModule,
    ContractsModule,
    BoardModule,
    SchedulerModule,
    DocumentsModule,
    RecommendationsModule,
    ComplianceModule,
    EvaluationsModule,
    RagModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
