import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { PipelineStage, UserRole } from '@prisma/client';
import { ApplicationsModule } from '../applications.module';
import { AuthModule } from '../../auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('ApplicationsController (integration, PrismaService mocked — no live DB required)', () => {
  let app: INestApplication;
  let prisma: any;
  let jwt: JwtService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    prisma = {
      application: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [ApplicationsModule, AuthModule],
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

  it('rejects requests with no bearer token', async () => {
    await request(app.getHttpServer()).get('/applications').expect(401);
  });

  it('rejects a HIRING_MANAGER creating an application (only CANDIDATE may apply)', async () => {
    await request(app.getHttpServer())
      .post('/applications')
      .set('Authorization', `Bearer ${tokenFor(UserRole.HIRING_MANAGER)}`)
      .send({ jobId: 'job1' })
      .expect(403);
  });

  it('allows a CANDIDATE to create an application, ignoring any extra/forbidden DTO fields', async () => {
    prisma.application.create.mockResolvedValue({
      id: 'app1',
      jobId: 'job1',
      candidateId: 'cand1',
      stage: PipelineStage.APPLIED,
    });

    const res = await request(app.getHttpServer())
      .post('/applications')
      .set('Authorization', `Bearer ${tokenFor(UserRole.CANDIDATE, 'cand1')}`)
      .send({ jobId: 'job1', coverLetter: 'Excited to apply!' })
      .expect(201);

    expect(res.body.stage).toBe(PipelineStage.APPLIED);
    expect(prisma.application.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ candidateId: 'cand1' }) }),
    );
  });

  it('rejects a request body with a field not in the DTO (whitelist validation)', async () => {
    await request(app.getHttpServer())
      .post('/applications')
      .set('Authorization', `Bearer ${tokenFor(UserRole.CANDIDATE)}`)
      .send({ jobId: 'job1', candidateId: 'someone-else-entirely' })
      .expect(400);
  });

  it('rejects an invalid stage value on the stage-transition DTO', async () => {
    await request(app.getHttpServer())
      .patch('/applications/app1/stage')
      .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER)}`)
      .send({ stage: 'NOT_A_REAL_STAGE' })
      .expect(400);
  });

  it('performs a role-guarded stage transition end-to-end through the HTTP layer', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'app1', stage: PipelineStage.APPLIED, candidateId: 'cand1' });
    prisma.application.update.mockResolvedValue({ id: 'app1', stage: PipelineStage.SCREENED, candidateId: 'cand1' });

    const res = await request(app.getHttpServer())
      .patch('/applications/app1/stage')
      .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER)}`)
      .send({ stage: PipelineStage.SCREENED })
      .expect(200);

    expect(res.body.stage).toBe(PipelineStage.SCREENED);
  });
});
