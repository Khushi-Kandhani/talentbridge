import { ForbiddenException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PipelineStage, UserRole } from '@prisma/client';
import { ApplicationsService } from '../applications.service';

jest.mock('pdf-parse', () => jest.fn());
const pdfParseMock = require('pdf-parse') as jest.Mock;

describe('ApplicationsService.create (duplicate-application guard)', () => {
  it('creates an application normally on first apply', async () => {
    const prisma: any = {
      application: {
        create: jest.fn().mockResolvedValue({ id: 'app1', jobId: 'job1', candidateId: 'cand1', stage: 'APPLIED' }),
      },
    };
    const ai: any = { screenCv: jest.fn() };
    const gateway: any = { notifyUser: jest.fn() };
    const service = new ApplicationsService(prisma, ai, gateway);

    const result = await service.create({ jobId: 'job1' } as any, 'cand1');

    expect(result.id).toBe('app1');
    expect(prisma.application.create).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictException when the candidate has already applied to this job (Prisma P2002)', async () => {
    const prisma: any = {
      application: {
        create: jest.fn().mockRejectedValue({ code: 'P2002', meta: { target: ['jobId', 'candidateId'] } }),
      },
    };
    const ai: any = { screenCv: jest.fn() };
    const gateway: any = { notifyUser: jest.fn() };
    const service = new ApplicationsService(prisma, ai, gateway);

    await expect(service.create({ jobId: 'job1' } as any, 'cand1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('rethrows non-unique-constraint errors as-is', async () => {
    const prisma: any = {
      application: {
        create: jest.fn().mockRejectedValue(new Error('connection lost')),
      },
    };
    const ai: any = { screenCv: jest.fn() };
    const gateway: any = { notifyUser: jest.fn() };
    const service = new ApplicationsService(prisma, ai, gateway);

    await expect(service.create({ jobId: 'job1' } as any, 'cand1')).rejects.toThrow('connection lost');
  });
});

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

  it('allows a RECRUITER to move SCREENED -> SHORTLISTED', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', stage: PipelineStage.SCREENED, candidateId: 'cand1' });
    prisma.application.update.mockResolvedValue({ id: 'a1', stage: PipelineStage.SHORTLISTED, candidateId: 'cand1' });

    const result = await service.updateStage('a1', PipelineStage.SHORTLISTED, { userId: 'rec1', role: UserRole.RECRUITER });
    expect(result.stage).toBe(PipelineStage.SHORTLISTED);
  });

  it('rejects a HIRING_MANAGER trying to move SCREENED -> SHORTLISTED (that is the recruiter\'s job)', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', stage: PipelineStage.SCREENED, candidateId: 'cand1' });

    await expect(
      service.updateStage('a1', PipelineStage.SHORTLISTED, { userId: 'mgr1', role: UserRole.HIRING_MANAGER }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a RECRUITER trying to move SHORTLISTED -> INTERVIEW_SCHEDULED (that is the hiring manager\'s job)', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', stage: PipelineStage.SHORTLISTED, candidateId: 'cand1' });

    await expect(
      service.updateStage('a1', PipelineStage.INTERVIEW_SCHEDULED, { userId: 'rec1', role: UserRole.RECRUITER }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a HIRING_MANAGER to move SHORTLISTED -> INTERVIEW_SCHEDULED', async () => {
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', stage: PipelineStage.SHORTLISTED, candidateId: 'cand1' });
    prisma.application.update.mockResolvedValue({ id: 'a1', stage: PipelineStage.INTERVIEW_SCHEDULED, candidateId: 'cand1' });

    const result = await service.updateStage('a1', PipelineStage.INTERVIEW_SCHEDULED, { userId: 'mgr1', role: UserRole.HIRING_MANAGER });
    expect(result.stage).toBe(PipelineStage.INTERVIEW_SCHEDULED);
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

describe('ApplicationsService.uploadCv', () => {
  const baseApplication = {
    id: 'app1',
    candidateId: 'cand1',
    job: {
      id: 'job1',
      title: 'Senior Backend Engineer',
      responsibilities: 'Build APIs',
      cultureNotes: 'Fast-paced',
      requiredSkills: ['NestJS', 'PostgreSQL'],
    },
  };

  const makeFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
    ({
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('fake pdf bytes'),
      ...overrides,
    }) as Express.Multer.File;

  beforeEach(() => {
    pdfParseMock.mockReset();
  });

  it('extracts CV text, scores it via AI, and persists all four AI fields on success', async () => {
    const prisma: any = {
      application: {
        findUnique: jest.fn().mockResolvedValue(baseApplication),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'app1', ...data })),
      },
    };
    const extraction = {
      name: 'Jane Doe',
      yearsOfExperience: 6,
      topSkills: ['NestJS', 'PostgreSQL', 'TypeScript'],
      educationLevel: "Bachelor's",
      lastRole: 'Backend Engineer at Acme',
    };
    const ai: any = {
      screenCv: jest.fn().mockResolvedValue({
        extraction,
        matchScore: 82,
        strengths: ['Strong NestJS background', 'Relevant DB experience', 'Good seniority match'],
        gaps: ['No mentioned Kubernetes experience', 'No leadership experience listed'],
        source: 'ai',
      }),
    };
    const gateway: any = { notifyUser: jest.fn() };
    pdfParseMock.mockResolvedValue({ text: 'Jane Doe CV text...' });

    const service = new ApplicationsService(prisma, ai, gateway);
    const result = await service.uploadCv('app1', 'cand1', makeFile());

    expect(ai.screenCv).toHaveBeenCalledWith({
      cvText: 'Jane Doe CV text...',
      jobDescription: 'Senior Backend Engineer\nBuild APIs\nFast-paced',
      requiredSkills: ['NestJS', 'PostgreSQL'],
    });
    expect(prisma.application.update).toHaveBeenCalledTimes(2);
    expect(result.aiScore).toBe(82);
    expect(result.aiExtractedProfile).toEqual(extraction);
    expect(result.aiStrengths).toHaveLength(3);
    expect(result.aiGaps).toHaveLength(2);
  });

  it('stores the CV with no AI fields when AI screening fails (spec §4.2 fallback)', async () => {
    const prisma: any = {
      application: {
        findUnique: jest.fn().mockResolvedValue(baseApplication),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'app1', ...data })),
      },
    };
    const ai: any = { screenCv: jest.fn().mockRejectedValue(new Error('Gemini timeout')) };
    const gateway: any = { notifyUser: jest.fn() };
    pdfParseMock.mockResolvedValue({ text: 'Some CV text' });

    const service = new ApplicationsService(prisma, ai, gateway);
    const result = await service.uploadCv('app1', 'cand1', makeFile());

    // Only the first update (storing cvText) should have happened — the second,
    // AI-fields update, is skipped entirely when screenCv throws.
    expect(prisma.application.update).toHaveBeenCalledTimes(1);
    expect(result.cvText).toBe('Some CV text');
    expect(result.aiScore).toBeUndefined();
  });

  it('rejects a non-PDF file before ever touching prisma or the AI service', async () => {
    const prisma: any = { application: { findUnique: jest.fn(), update: jest.fn() } };
    const ai: any = { screenCv: jest.fn() };
    const gateway: any = { notifyUser: jest.fn() };
    const service = new ApplicationsService(prisma, ai, gateway);

    await expect(
      service.uploadCv('app1', 'cand1', makeFile({ mimetype: 'application/msword' })),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.application.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a file over 5MB', async () => {
    const prisma: any = { application: { findUnique: jest.fn(), update: jest.fn() } };
    const ai: any = { screenCv: jest.fn() };
    const gateway: any = { notifyUser: jest.fn() };
    const service = new ApplicationsService(prisma, ai, gateway);

    await expect(
      service.uploadCv('app1', 'cand1', makeFile({ size: 6 * 1024 * 1024 })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the candidate does not own the application', async () => {
    const prisma: any = {
      application: { findUnique: jest.fn().mockResolvedValue(baseApplication), update: jest.fn() },
    };
    const ai: any = { screenCv: jest.fn() };
    const gateway: any = { notifyUser: jest.fn() };
    const service = new ApplicationsService(prisma, ai, gateway);

    await expect(
      service.uploadCv('app1', 'someone-else', makeFile()),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws NotFoundException when the application does not exist', async () => {
    const prisma: any = { application: { findUnique: jest.fn().mockResolvedValue(null), update: jest.fn() } };
    const ai: any = { screenCv: jest.fn() };
    const gateway: any = { notifyUser: jest.fn() };
    const service = new ApplicationsService(prisma, ai, gateway);

    await expect(service.uploadCv('missing', 'cand1', makeFile())).rejects.toBeInstanceOf(NotFoundException);
  });
});
