import { Module } from '@nestjs/common';
import { TalentBridgeGateway } from './talent-bridge.gateway';

@Module({
  providers: [TalentBridgeGateway],
})
export class GatewayModule {}
