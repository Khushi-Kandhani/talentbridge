import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
=======
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
>>>>>>> 074ea285712a8fea6a19a9dde12639385655a56a

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
<<<<<<< HEAD
  exports: [AnalyticsService],
=======
>>>>>>> 074ea285712a8fea6a19a9dde12639385655a56a
})
export class AnalyticsModule {}
