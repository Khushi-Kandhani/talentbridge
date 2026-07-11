import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Full-app smoke test. PrismaService is overridden with a no-op mock so this
 * suite runs anywhere without a live Postgres instance — routes that would
 * actually touch the database are covered separately by the per-module
 * integration specs (e.g. applications.controller.spec.ts) and by
 * role-guards.e2e-spec.ts.
 */
describe('TalentBridge API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        user: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn() },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/health (GET) is publicly reachable', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(response.body.status).toBe('ok');
  });

  describe('role-protected routes reject unauthenticated requests', () => {
    it.each([
      ['post', '/api/v1/jobs'],
      ['get', '/api/v1/jobs'],
      ['post', '/api/v1/applications'],
      ['get', '/api/v1/applications'],
      ['post', '/api/v1/interviews'],
      ['post', '/api/v1/offers'],
      ['get', '/api/v1/users'],
      ['post', '/api/v1/ai/generate-job-description'],
      ['post', '/api/v1/ai/screen-cv'],
    ])('%s %s returns 401 without a bearer token', async (method, path) => {
      await (request(app.getHttpServer()) as any)[method](path).send({}).expect(401);
    });
  });

  describe('auth validation', () => {
    it('rejects registration with an invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: 'password123', role: 'CANDIDATE' })
        .expect(400);
    });

    it('rejects login with missing fields', async () => {
      await request(app.getHttpServer()).post('/api/v1/auth/login').send({}).expect(400);
    });
  });
});
