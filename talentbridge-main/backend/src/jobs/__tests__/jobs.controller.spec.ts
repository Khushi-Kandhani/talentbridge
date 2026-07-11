import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { JobStatus, UserRole } from '@prisma/client';
import { JobsModule } from '../jobs.module';
import { AuthModule } from '../../auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('JobsController (integration, PrismaService mocked — no live DB required)', () => {
  let app: INestApplication;
  let prisma: any;
  let jwt: JwtService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    prisma = {
      jobPosting: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [JobsModule, AuthModule],
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

  it('rejects a CANDIDATE creating a job posting (only RECRUITER may)', async () => {
    await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${tokenFor(UserRole.CANDIDATE)}`)
      .send({ title: 'Engineer', department: 'Eng', type: 'full-time', requiredSkills: ['React'] })
      .expect(403);
  });

  it('allows a RECRUITER to create a job posting, always starting as DRAFT', async () => {
    prisma.jobPosting.create.mockResolvedValue({ id: 'j1', status: JobStatus.DRAFT, recruiterId: 'rec1' });

    const res = await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER, 'rec1')}`)
      .send({ title: 'Engineer', department: 'Eng', type: 'full-time', requiredSkills: ['React'] })
      .expect(201);

    expect(res.body.status).toBe(JobStatus.DRAFT);
  });

  it('rejects a missing required field (requiredSkills) on job creation', async () => {
    await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER)}`)
      .send({ title: 'Engineer', department: 'Eng', type: 'full-time' })
      .expect(400);
  });

  it('rejects an invalid status transition end-to-end (Draft -> Closed skips Published)', async () => {
    prisma.jobPosting.findUnique.mockResolvedValue({ id: 'j1', status: JobStatus.DRAFT, recruiterId: 'rec1' });

    await request(app.getHttpServer())
      .patch('/jobs/j1/status')
      .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER, 'rec1')}`)
      .send({ status: JobStatus.CLOSED })
      .expect(400);
  });

  it('lets a RECRUITER publish their own DRAFT job end-to-end', async () => {
    prisma.jobPosting.findUnique.mockResolvedValue({ id: 'j1', status: JobStatus.DRAFT, recruiterId: 'rec1' });
    prisma.jobPosting.update.mockResolvedValue({ id: 'j1', status: JobStatus.PUBLISHED, recruiterId: 'rec1' });

    const res = await request(app.getHttpServer())
      .patch('/jobs/j1/status')
      .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER, 'rec1')}`)
      .send({ status: JobStatus.PUBLISHED })
      .expect(200);

    expect(res.body.status).toBe(JobStatus.PUBLISHED);
  });
});
