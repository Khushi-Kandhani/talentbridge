import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { PipelineStage, UserRole } from '@prisma/client';
import { ApplicationsService } from '../applications.service';

describe('ApplicationsService.updateStage (role-guarded pipeline transitions)', () => {
  let prisma: any;
  let ai: any;
  let gateway: any;
  let service: ApplicationsService;

  beforeEach(() => {
    prisma = {
      application: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    ai = { screenCv: jest.fn() };
    gateway = { notifyUser: jest.fn() };
    service = new ApplicationsService(prisma, ai, gateway);
  });

  it('allows a RECRUITER to move APPLIED -> SCREENED', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', stage: PipelineStage.APPLIED, candidateId: 'cand1' });
    prisma.application.update.mockResolvedValue({ id: 'a1', stage: PipelineStage.SCREENED, candidateId: 'cand1' });

    const result = await service.updateStage('a1', PipelineStage.SCREENED, { userId: 'rec1', role: UserRole.RECRUITER });

    expect(result.stage).toBe(PipelineStage.SCREENED);
    expect(gateway.notifyUser).toHaveBeenCalledWith('cand1', 'application:stage-changed', expect.any(Object));
  });

  it('rejects a CANDIDATE trying to move APPLIED -> SCREENED', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', stage: PipelineStage.APPLIED, candidateId: 'cand1' });

    await expect(
      service.updateStage('a1', PipelineStage.SCREENED, { userId: 'cand1', role: UserRole.CANDIDATE }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a RECRUITER trying to move SCREENED -> SHORTLISTED (that is the hiring manager\'s job)', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', stage: PipelineStage.SCREENED, candidateId: 'cand1' });

    await expect(
      service.updateStage('a1', PipelineStage.SHORTLISTED, { userId: 'rec1', role: UserRole.RECRUITER }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a HIRING_MANAGER to move SCREENED -> SHORTLISTED', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', stage: PipelineStage.SCREENED, candidateId: 'cand1' });
    prisma.application.update.mockResolvedValue({ id: 'a1', stage: PipelineStage.SHORTLISTED, candidateId: 'cand1' });

    const result = await service.updateStage('a1', PipelineStage.SHORTLISTED, { userId: 'mgr1', role: UserRole.HIRING_MANAGER });
    expect(result.stage).toBe(PipelineStage.SHORTLISTED);
  });

  it('rejects skipping a stage (APPLIED -> SHORTLISTED directly)', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', stage: PipelineStage.APPLIED, candidateId: 'cand1' });

    await expect(
      service.updateStage('a1', PipelineStage.SHORTLISTED, { userId: 'mgr1', role: UserRole.HIRING_MANAGER }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows a RECRUITER or HIRING_MANAGER to reject from a non-terminal stage', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', stage: PipelineStage.SHORTLISTED, candidateId: 'cand1' });
    prisma.application.update.mockResolvedValue({ id: 'a1', stage: PipelineStage.REJECTED, candidateId: 'cand1' });

    const result = await service.updateStage('a1', PipelineStage.REJECTED, { userId: 'rec1', role: UserRole.RECRUITER });
    expect(result.stage).toBe(PipelineStage.REJECTED);
  });

  it('rejects any transition once an application is already in a terminal stage', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', stage: PipelineStage.HIRED, candidateId: 'cand1' });

    await expect(
      service.updateStage('a1', PipelineStage.REJECTED, { userId: 'rec1', role: UserRole.RECRUITER }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('ApplicationsService.bulkUpdateStage', () => {
  it('advances multiple applications and reports per-item errors without throwing', async () => {
    const prisma: any = {
      application: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({ id: 'a1', stage: PipelineStage.APPLIED, candidateId: 'c1' })
          .mockResolvedValueOnce({ id: 'a2', stage: PipelineStage.HIRED, candidateId: 'c2' }),
        update: jest.fn().mockResolvedValue({ id: 'a1', stage: PipelineStage.SCREENED, candidateId: 'c1' }),
      },
    };
    const gateway: any = { notifyUser: jest.fn() };
    const service = new ApplicationsService(prisma, {} as any, gateway);

    const results = await service.bulkUpdateStage(
      { applicationIds: ['a1', 'a2'], stage: PipelineStage.SCREENED },
      { userId: 'rec1', role: UserRole.RECRUITER },
    );

    expect(results[0]!.application!.stage).toBe(PipelineStage.SCREENED);
    expect(results[1]!.error).toBeDefined(); // a2 is already HIRED (terminal)
  });
});
