import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';
import { UserRole } from '@prisma/client';

import { ApplicationsController } from '../src/applications/applications.controller';
import { ApplicationsService } from '../src/applications/applications.service';
import { JobsController } from '../src/jobs/jobs.controller';
import { JobsService } from '../src/jobs/jobs.service';
import { AiController } from '../src/ai/ai.controller';
import { AiService } from '../src/ai/ai.service';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';

/**
 * HTTP-level integration tests for role-protected routes (spec §5 mandatory
 * constraint: "All role-protected API routes must have Jest + Supertest
 * integration tests"). These boot a real Nest HTTP server with the real
 * JwtAuthGuard/RolesGuard pipeline, but swap Prisma-backed services for
 * mocks so the suite runs without a live database.
 */
describe('Role-protected routes (integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const applicationsService = {
    create: jest.fn().mockResolvedValue({ id: 'app1', stage: 'APPLIED' }),
    list: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue({ id: 'app1' }),
    uploadCv: jest.fn(),
    updateStage: jest.fn().mockResolvedValue({ id: 'app1', stage: 'SCREENED' }),
    bulkUpdateStage: jest.fn(),
  };
  const jobsService = {
    create: jest.fn().mockResolvedValue({ id: 'job1', status: 'DRAFT' }),
    list: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue({ id: 'job1' }),
    updateStatus: jest.fn().mockResolvedValue({ id: 'job1', status: 'PUBLISHED' }),
  };
  const aiService = {
    generateJobDescription: jest.fn().mockResolvedValue({ source: 'fallback' }),
    screenCv: jest.fn(),
    generateInterviewQuestions: jest.fn(),
    draftOfferLetter: jest.fn(),
  };
  const usersService = {
    list: jest.fn().mockResolvedValue([]),
    updateRole: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({})],
      controllers: [ApplicationsController, JobsController, AiController, UsersController],
      providers: [
        { provide: ApplicationsService, useValue: applicationsService },
        { provide: JobsService, useValue: jobsService },
        { provide: AiService, useValue: aiService },
        { provide: UsersService, useValue: usersService },
        JwtStrategy,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    jwtService = new JwtService({ secret: 'test-secret' });
  });

  afterAll(async () => {
    await app.close();
  });

  function tokenFor(role: UserRole, userId = 'user1') {
    return jwtService.sign({ sub: userId, email: 'user@example.com', role }, { secret: 'test-secret' });
  }

  it('rejects an unauthenticated request with 401', async () => {
    await request(app.getHttpServer()).get('/applications').expect(401);
  });

  it('rejects a request with a garbage token with 401', async () => {
    await request(app.getHttpServer())
      .get('/applications')
      .set('Authorization', 'Bearer not-a-real-token')
      .expect(401);
  });

  it('allows a CANDIDATE to create an application', async () => {
    await request(app.getHttpServer())
      .post('/applications')
      .set('Authorization', `Bearer ${tokenFor(UserRole.CANDIDATE)}`)
      .send({ jobId: 'job1', coverLetter: 'Excited to apply' })
      .expect(201);
    expect(applicationsService.create).toHaveBeenCalledWith(expect.objectContaining({ jobId: 'job1' }), 'user1');
  });

  it('forbids a RECRUITER from creating an application (candidate-only route)', async () => {
    await request(app.getHttpServer())
      .post('/applications')
      .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER)}`)
      .send({ jobId: 'job1' })
      .expect(403);
  });

  it('allows a RECRUITER to create a job posting', async () => {
    await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER)}`)
      .send({ title: 'Backend Engineer', department: 'Engineering', type: 'full-time', requiredSkills: ['Node.js'] })
      .expect(201);
  });

  it('forbids a CANDIDATE from creating a job posting', async () => {
    await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${tokenFor(UserRole.CANDIDATE)}`)
      .send({ title: 'Backend Engineer', department: 'Engineering', type: 'full-time', requiredSkills: ['Node.js'] })
      .expect(403);
  });

  it('forbids a CANDIDATE from calling the AI job description generator (recruiter-only)', async () => {
    await request(app.getHttpServer())
      .post('/ai/generate-job-description')
      .set('Authorization', `Bearer ${tokenFor(UserRole.CANDIDATE)}`)
      .send({ title: 'Backend Engineer', department: 'Engineering', requiredSkills: ['Node.js'], level: 'mid' })
      .expect(403);
  });

  it('allows a RECRUITER to call the AI job description generator', async () => {
    await request(app.getHttpServer())
      .post('/ai/generate-job-description')
      .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER)}`)
      .send({ title: 'Backend Engineer', department: 'Engineering', requiredSkills: ['Node.js'], level: 'mid' })
      .expect(201);
  });

  it('forbids a HIRING_MANAGER from calling CV screening (recruiter/manager both allowed — sanity check the allowed side works)', async () => {
    await request(app.getHttpServer())
      .post('/ai/screen-cv')
      .set('Authorization', `Bearer ${tokenFor(UserRole.HIRING_MANAGER)}`)
      .send({ cvText: 'x', jobDescription: 'y', requiredSkills: ['React'] })
      .expect(201);
  });

  it('forbids a non-ADMIN from listing users', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER)}`)
      .expect(403);
  });

  it('allows an ADMIN to list users', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${tokenFor(UserRole.ADMIN)}`)
      .expect(200);
  });

  it('rejects an invalid body with 400 (ValidationPipe active end-to-end)', async () => {
    await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER)}`)
      .send({ title: '' }) // missing required fields
      .expect(400);
  });
});
