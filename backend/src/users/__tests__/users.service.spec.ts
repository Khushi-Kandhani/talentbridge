import { UsersService } from '../users.service';

describe('UsersService', () => {
  let prisma: any;
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new UsersService(prisma);
  });

  describe('create', () => {
    it('creates a user with the given email, passwordHash, and role', async () => {
      prisma.user.create.mockResolvedValue({ id: 'u1', email: 'a@x.com', role: 'RECRUITER' });

      const result = await service.create({ email: 'a@x.com', passwordHash: 'already-hashed', role: 'RECRUITER' } as any);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: 'a@x.com', passwordHash: 'already-hashed', role: 'RECRUITER' },
      });
      expect(result).toEqual({ id: 'u1', email: 'a@x.com', role: 'RECRUITER' });
    });
  });

  describe('list', () => {
    it('returns users without passwordHash or refreshTokenHash', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u1', email: 'a@x.com', role: 'CANDIDATE', createdAt: new Date(), updatedAt: new Date() },
      ]);

      const result = await service.list();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[0]).not.toHaveProperty('refreshTokenHash');
    });
  });
});
