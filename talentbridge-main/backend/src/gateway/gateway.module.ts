import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TalentBridgeGateway } from './talent-bridge.gateway';

@Module({
  imports: [JwtModule.register({})],
  providers: [TalentBridgeGateway],
  exports: [TalentBridgeGateway],
})
export class GatewayModule {}
