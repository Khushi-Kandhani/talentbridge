import { AuthService } from '../auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let prisma: any;
  let jwtService: any;
  let service: AuthService;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv, JWT_SECRET: 'test-secret', JWT_REFRESH_SECRET: 'test-refresh-secret' };
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    jwtService = {
      signAsync: jest.fn()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
    };
    service = new AuthService(prisma, jwtService);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('register', () => {
    it('creates a new user and returns tokens when the email is not taken', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValue('hashed-password' as never);
      prisma.user.create.mockResolvedValue({ id: 'u1', email: 'a@x.com', firstName: 'Jane', lastName: 'Doe', role: 'CANDIDATE' });

      const result = await service.register({ email: 'a@x.com', password: 'password123', firstName: 'Jane', lastName: 'Doe', role: 'CANDIDATE' } as any);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: 'a@x.com', passwordHash: 'hashed-password', firstName: 'Jane', lastName: 'Doe', role: 'CANDIDATE' },
      });
      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { refreshTokenHash: expect.any(String) },
      });
    });

    it('throws ConflictException when the email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ email: 'a@x.com', password: 'password123', firstName: 'Jane', lastName: 'Doe', role: 'CANDIDATE' } as any),
      ).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns tokens when credentials are valid', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@x.com', role: 'CANDIDATE', passwordHash: 'hashed' });
      bcryptMock.compare.mockResolvedValue(true as never);

      const result = await service.login({ email: 'a@x.com', password: 'password123' } as any);

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'nope@x.com', password: 'x' } as any)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@x.com', role: 'CANDIDATE', passwordHash: 'hashed' });
      bcryptMock.compare.mockResolvedValue(false as never);

      await expect(service.login({ email: 'a@x.com', password: 'wrong' } as any)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('returns new tokens when the refresh token matches the stored hash', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@x.com', role: 'CANDIDATE', refreshTokenHash: 'stored-hash' });
      bcryptMock.compare.mockResolvedValue(true as never);
      bcryptMock.hash.mockResolvedValue('new-hash' as never);

      const result = await service.refresh('u1', 'old-refresh-token');

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    });

    it('throws UnauthorizedException when the user has no stored refresh token hash', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', refreshTokenHash: null });

      await expect(service.refresh('u1', 'token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh('ghost', 'token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the refresh token does not match the stored hash', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', refreshTokenHash: 'stored-hash' });
      bcryptMock.compare.mockResolvedValue(false as never);

      await expect(service.refresh('u1', 'wrong-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('clears the stored refresh token hash and returns success', async () => {
      prisma.user.update.mockResolvedValue({ id: 'u1', refreshTokenHash: null });

      const result = await service.logout('u1');

      expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { refreshTokenHash: null } });
      expect(result).toEqual({ success: true });
    });
  });
});
