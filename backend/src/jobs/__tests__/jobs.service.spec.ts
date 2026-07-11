import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JobStatus, UserRole } from '@prisma/client';
import { JobsService } from '../jobs.service';

describe('JobsService.updateStatus (Draft -> Published -> Closed -> Archived)', () => {
  let prisma: any;
  let service: JobsService;

  beforeEach(() => {
    prisma = {
      jobPosting: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new JobsService(prisma);
  });

  it('allows the owning RECRUITER to publish a DRAFT job', async () => {
    prisma.jobPosting.findUnique.mockResolvedValue({ id: 'j1', status: JobStatus.DRAFT, recruiterId: 'rec1' });
    prisma.jobPosting.update.mockResolvedValue({ id: 'j1', status: JobStatus.PUBLISHED, recruiterId: 'rec1' });

    const result = await service.updateStatus('j1', JobStatus.PUBLISHED, { userId: 'rec1', role: UserRole.RECRUITER });
    expect(result.status).toBe(JobStatus.PUBLISHED);
  });

  it('rejects a RECRUITER updating another recruiter\'s job posting', async () => {
    prisma.jobPosting.findUnique.mockResolvedValue({ id: 'j1', status: JobStatus.DRAFT, recruiterId: 'rec1' });

    await expect(
      service.updateStatus('j1', JobStatus.PUBLISHED, { userId: 'rec2', role: UserRole.RECRUITER }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects skipping straight from DRAFT to CLOSED', async () => {
    prisma.jobPosting.findUnique.mockResolvedValue({ id: 'j1', status: JobStatus.DRAFT, recruiterId: 'rec1' });

    await expect(
      service.updateStatus('j1', JobStatus.CLOSED, { userId: 'rec1', role: UserRole.RECRUITER }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects any transition out of ARCHIVED (terminal state)', async () => {
    prisma.jobPosting.findUnique.mockResolvedValue({ id: 'j1', status: JobStatus.ARCHIVED, recruiterId: 'rec1' });

    await expect(
      service.updateStatus('j1', JobStatus.PUBLISHED, { userId: 'rec1', role: UserRole.RECRUITER }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException for a non-existent job', async () => {
    prisma.jobPosting.findUnique.mockResolvedValue(null);

    await expect(
      service.updateStatus('missing', JobStatus.PUBLISHED, { userId: 'rec1', role: UserRole.RECRUITER }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('JobsService.list (visibility)', () => {
  it('only returns PUBLISHED jobs to a CANDIDATE', async () => {
    const prisma: any = { jobPosting: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new JobsService(prisma);

    await service.list({ userId: 'cand1', role: UserRole.CANDIDATE });

    expect(prisma.jobPosting.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: JobStatus.PUBLISHED } }),
    );
  });

  it('returns all jobs (any status) to a RECRUITER', async () => {
    const prisma: any = { jobPosting: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new JobsService(prisma);

    await service.list({ userId: 'rec1', role: UserRole.RECRUITER });

    expect(prisma.jobPosting.findMany).toHaveBeenCalledWith(expect.not.objectContaining({ where: expect.anything() }));
  });
});
