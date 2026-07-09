import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      service: 'TalentBridge API',
      timestamp: new Date().toISOString(),
    };
  }
}
