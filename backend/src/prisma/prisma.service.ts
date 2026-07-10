import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Application, Interview, JobPosting, Offer, User } from '@prisma/client';

export type { Application, Interview, JobPosting, Offer, User };

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    await this.$disconnect();
  }
}
