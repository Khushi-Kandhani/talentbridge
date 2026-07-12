import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { InterviewsModule } from './interviews/interviews.module';
import { OffersModule } from './offers/offers.module';
import { GatewayModule } from './gateway/gateway.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    JobsModule,
    ApplicationsModule,
    InterviewsModule,
    OffersModule,
    GatewayModule,
    AuthModule,
    AiModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule {}
