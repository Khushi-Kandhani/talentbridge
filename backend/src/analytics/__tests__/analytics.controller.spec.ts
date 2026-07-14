import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { AnalyticsModule } from '../analytics.module';
import { AuthModule } from '../../auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnalyticsController (integration, PrismaService mocked)', () => {
  let app: INestApplication;
  let prisma: any;
  let jwt: JwtService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    prisma = {
      application: { count: jest.fn(), findMany: jest.fn() },
      jobPosting: { count: jest.fn() },
      interview: { count: jest.fn() },
      offer: { findMany: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AnalyticsModule, AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    jwt = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  function tokenFor(role: UserRole, sub = 'user1') {
    return jwt.sign({ sub, email: 'x@example.com', role }, { secret: process.env.JWT_SECRET });
  }

  it('rejects analytics access without a bearer token', async () => {
    await request(app.getHttpServer()).get('/analytics/overview').expect(401);
  });

  it('allows a recruiter to read the analytics overview', async () => {
    prisma.application.count.mockResolvedValue(12);
    prisma.jobPosting.count.mockResolvedValue(3);
    prisma.interview.count.mockResolvedValue(4);
    prisma.offer.findMany.mockResolvedValue([]);
    prisma.application.findMany.mockResolvedValue([]);

    const token = tokenFor(UserRole.RECRUITER);
    const res = await request(app.getHttpServer())
      .get('/analytics/overview')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.summary.totalApplications).toBe(12);
    expect(res.body.metrics.timeToHireDays).toBe(14);
  });
});
