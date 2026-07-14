import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { UsersModule } from '../users.module';
import { AuthModule } from '../../auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersController (integration, PrismaService mocked — no live DB required)', () => {
  let app: INestApplication;
  let prisma: any;
  let jwt: JwtService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    prisma = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule, AuthModule, PassportModule, JwtModule.register({})],
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function tokenFor(role: UserRole, sub = 'user1') {
    // We add both 'sub' and 'id' to the token payload so req.user.id is correctly populated in tests
    return jwt.sign({ sub, id: sub, email: 'x@example.com', role }, { secret: process.env.JWT_SECRET });
  }

  describe('GET /users', () => {
    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('rejects a non-ADMIN authenticated user with 403', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER)}`)
        .expect(403);
    });

    it('allows an ADMIN to list users, without leaking password hashes', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u1', email: 'a@x.com', role: UserRole.CANDIDATE, createdAt: new Date(), updatedAt: new Date() },
      ]);

      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${tokenFor(UserRole.ADMIN)}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).not.toHaveProperty('passwordHash');
      expect(res.body[0]).not.toHaveProperty('refreshTokenHash');
    });
  });

  describe('POST /users', () => {
    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'a@x.com', passwordHash: 'hashed-password-value', role: UserRole.CANDIDATE })
        .expect(401);
    });

    it('rejects a non-ADMIN authenticated user with 403', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER)}`)
        .send({ email: 'a@x.com', passwordHash: 'hashed-password-value', role: UserRole.CANDIDATE })
        .expect(403);
    });

    it('allows an ADMIN to create a user', async () => {
      prisma.user.create.mockResolvedValue({ id: 'u2', email: 'new@x.com', role: UserRole.RECRUITER });

      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${tokenFor(UserRole.ADMIN)}`)
        .send({ email: 'new@x.com', passwordHash: 'hashed-password-value', role: UserRole.RECRUITER })
        .expect(201);

      expect(res.body.email).toBe('new@x.com');
    });
  });

  describe('PATCH /users/:id/role', () => {
    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer())
        .patch('/users/u1/role')
        .send({ role: UserRole.RECRUITER })
        .expect(401);
    });

    it('rejects a non-ADMIN authenticated user with 403', async () => {
      await request(app.getHttpServer())
        .patch('/users/u1/role')
        .set('Authorization', `Bearer ${tokenFor(UserRole.RECRUITER)}`)
        .send({ role: UserRole.RECRUITER })
        .expect(403);
    });

    it('allows an ADMIN to update a role', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@x.com', role: UserRole.CANDIDATE });
      prisma.user.update.mockResolvedValue({ id: 'u1', email: 'a@x.com', role: UserRole.HIRING_MANAGER });

      const res = await request(app.getHttpServer())
        .patch('/users/u1/role')
        .set('Authorization', `Bearer ${tokenFor(UserRole.ADMIN)}`)
        .send({ role: UserRole.HIRING_MANAGER })
        .expect(200);

      expect(res.body.role).toBe(UserRole.HIRING_MANAGER);
    });

    it('returns 404 when the target user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/users/ghost/role')
        .set('Authorization', `Bearer ${tokenFor(UserRole.ADMIN)}`)
        .send({ role: UserRole.ADMIN })
        .expect(404);
    });

    it('rejects an invalid role value with 400', async () => {
      await request(app.getHttpServer())
        .patch('/users/u1/role')
        .set('Authorization', `Bearer ${tokenFor(UserRole.ADMIN)}`)
        .send({ role: 'NOT_A_ROLE' })
        .expect(400);
    });

    it('rejects an ADMIN attempting to change their own role with 403', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', email: 'admin@szabist.com', role: UserRole.ADMIN });

      await request(app.getHttpServer())
        .patch('/users/admin-1/role')
        .set('Authorization', `Bearer ${tokenFor(UserRole.ADMIN, 'admin-1')}`)
        .send({ role: UserRole.CANDIDATE })
        .expect(403);
    });
  });
});
