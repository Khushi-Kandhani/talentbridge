import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { AiModule } from '../ai/ai.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [AiModule, GatewayModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
