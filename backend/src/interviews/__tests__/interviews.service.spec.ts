import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { InterviewStatus, UserRole } from '@prisma/client';
import { InterviewsService } from '../interviews.service';

describe('InterviewsService.confirmSlot (conflict detection)', () => {
  let prisma: any;
  let gateway: any;
  let service: InterviewsService;

  beforeEach(() => {
    prisma = {
      interview: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    gateway = { notifyUser: jest.fn() };
    service = new InterviewsService(prisma, gateway);
  });

  it('confirms a slot when there is no conflict', async () => {
    prisma.interview.findUnique.mockResolvedValue({
      id: 'i1',
      managerId: 'mgr1',
      recruiterId: 'rec1',
      proposedSlots: ['2026-07-10T10:00:00Z'],
      application: { candidateId: 'cand1' },
    });
    prisma.interview.findFirst.mockResolvedValue(null);
    prisma.interview.update.mockResolvedValue({ id: 'i1', status: InterviewStatus.CONFIRMED, confirmedSlot: '2026-07-10T10:00:00Z' });

    const result = await service.confirmSlot('i1', '2026-07-10T10:00:00Z', { userId: 'cand1', role: UserRole.CANDIDATE });

    expect(result.status).toBe(InterviewStatus.CONFIRMED);
    expect(gateway.notifyUser).toHaveBeenCalledWith('rec1', 'interview:confirmed', expect.any(Object));
  });

  it('rejects a slot that conflicts with another confirmed interview for the same manager', async () => {
    prisma.interview.findUnique.mockResolvedValue({
      id: 'i1',
      managerId: 'mgr1',
      recruiterId: 'rec1',
      proposedSlots: ['2026-07-10T10:00:00Z'],
      application: { candidateId: 'cand1' },
    });
    prisma.interview.findFirst.mockResolvedValue({ id: 'i2' }); // an existing confirmed clash

    await expect(
      service.confirmSlot('i1', '2026-07-10T10:00:00Z', { userId: 'cand1', role: UserRole.CANDIDATE }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a candidate confirming an interview that is not theirs', async () => {
    prisma.interview.findUnique.mockResolvedValue({
      id: 'i1',
      managerId: 'mgr1',
      recruiterId: 'rec1',
      proposedSlots: [],
      application: { candidateId: 'someone-else' },
    });

    await expect(
      service.confirmSlot('i1', '2026-07-10T10:00:00Z', { userId: 'cand1', role: UserRole.CANDIDATE }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
