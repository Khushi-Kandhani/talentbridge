import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthModule } from '../auth.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthController (integration, PrismaService mocked — no live DB required)', () => {
  let app: INestApplication;
  let prisma: any;
  let jwt: JwtService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
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
    return jwt.sign({ sub, email: 'x@example.com', role }, { secret: process.env.JWT_SECRET });
  }

  describe('POST /auth/register', () => {
    it('registers a new user and returns an access/refresh token pair', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'u1', email: 'new@example.com', firstName: 'Jane', lastName: 'Doe', role: UserRole.CANDIDATE });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'new@example.com', password: 'password123', firstName: 'Jane', lastName: 'Doe', role: UserRole.CANDIDATE })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('rejects a duplicate email with 409', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'taken@example.com', password: 'password123', firstName: 'Jane', lastName: 'Doe', role: UserRole.CANDIDATE })
        .expect(409);
    });

    it('rejects a password shorter than 8 characters with 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'new@example.com', password: 'short', role: UserRole.CANDIDATE })
        .expect(400);
    });

    it('rejects an invalid role enum value with 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'new@example.com', password: 'password123', role: 'NOT_A_ROLE' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('logs in with valid credentials and returns tokens', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@x.com', role: UserRole.CANDIDATE, passwordHash });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'a@x.com', password: 'password123' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
    });

    it('rejects an unknown email with 401', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ghost@x.com', password: 'password123' })
        .expect(401);
    });

    it('rejects the wrong password with 401', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@x.com', role: UserRole.CANDIDATE, passwordHash });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'a@x.com', password: 'wrong-password' })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('rejects a request with no token at all with 401', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('rejects an access token used where a refresh token is required with 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${tokenFor(UserRole.CANDIDATE)}`) // signed with JWT_SECRET, wrong strategy
        .expect(401);
    });

    it('issues new tokens for a valid refresh token that matches the stored hash', async () => {
      const refreshToken = jwt.sign(
        { sub: 'u1', email: 'a@x.com', role: UserRole.CANDIDATE },
        { secret: process.env.JWT_REFRESH_SECRET },
      );
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@x.com', role: UserRole.CANDIDATE, refreshTokenHash });

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('rejects a refresh token that no longer matches the stored hash (already rotated) with 401', async () => {
      const refreshToken = jwt.sign(
        { sub: 'u1', email: 'a@x.com', role: UserRole.CANDIDATE },
        { secret: process.env.JWT_REFRESH_SECRET },
      );
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', refreshTokenHash: 'some-other-hash' });

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });

    it('logs out an authenticated user and clears the refresh token hash', async () => {
      prisma.user.update.mockResolvedValue({ id: 'user1', refreshTokenHash: null });

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${tokenFor(UserRole.CANDIDATE)}`)
        .expect(201);

      expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'user1' }, data: { refreshTokenHash: null } });
    });
  });
});
