import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PipelineStage, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { TalentBridgeGateway } from '../gateway/talent-bridge.gateway';
import { CreateApplicationDto } from './dto/create-application.dto';
import { BulkUpdateStageDto } from './dto/bulk-update-stage.dto';

/**
 * Forward-progress transitions and which role is allowed to perform them,
 * per spec §3.3: "recruiters screen, hiring managers shortlist and decide".
 * REJECTED is handled separately below since it can happen from almost any
 * non-terminal stage.
 */
const FORWARD_TRANSITIONS: Partial<Record<PipelineStage, { to: PipelineStage; roles: UserRole[] }>> = {
  APPLIED: { to: PipelineStage.SCREENED, roles: [UserRole.RECRUITER] },
  SCREENED: { to: PipelineStage.SHORTLISTED, roles: [UserRole.HIRING_MANAGER] },
  SHORTLISTED: { to: PipelineStage.INTERVIEW_SCHEDULED, roles: [UserRole.RECRUITER, UserRole.HIRING_MANAGER] },
  INTERVIEW_SCHEDULED: { to: PipelineStage.OFFER, roles: [UserRole.HIRING_MANAGER] },
  OFFER: { to: PipelineStage.HIRED, roles: [UserRole.HIRING_MANAGER] },
};

const TERMINAL_STAGES: PipelineStage[] = [PipelineStage.HIRED, PipelineStage.REJECTED];
const REJECT_ROLES: UserRole[] = [UserRole.RECRUITER, UserRole.HIRING_MANAGER];

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly gateway: TalentBridgeGateway,
  ) {}

  create(dto: CreateApplicationDto, candidateId: string) {
    return this.prisma.application.create({
      data: {
        jobId: dto.jobId,
        candidateId,
        coverLetter: dto.coverLetter,
        yearsOfExperience: dto.yearsOfExperience,
        salaryExpectation: dto.salaryExpectation,
        availabilityDate: dto.availabilityDate,
        cvText: dto.cvText,
        stage: PipelineStage.APPLIED,
      },
    });
  }

  /** Recruiters/managers/admins see everything; a candidate only ever sees their own applications. */
  list(requester: { userId: string; role: UserRole }, jobId?: string, sortByAiScore?: boolean) {
    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (requester.role === UserRole.CANDIDATE) where.candidateId = requester.userId;

    return this.prisma.application.findMany({
      where,
      include: { job: true },
      orderBy: sortByAiScore ? [{ aiScore: 'desc' }] : [{ createdAt: 'desc' }],
    });
  }

  async get(id: string, requester: { userId: string; role: UserRole }) {
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    if (requester.role === UserRole.CANDIDATE && application.candidateId !== requester.userId) {
      throw new ForbiddenException('You can only view your own applications');
    }
    return application;
  }

  /** Uploads and parses a CV, then kicks off AI screening (Feature 2) against the job it was submitted for. */
  async uploadCv(applicationId: string, candidateId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('CV file is required');
    if (file.mimetype !== 'application/pdf') throw new BadRequestException('Only PDF files are accepted');
    if (file.size > 5 * 1024 * 1024) throw new BadRequestException('CV must be 5 MB or smaller');

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.candidateId !== candidateId) {
      throw new ForbiddenException('You can only upload a CV to your own application');
    }

    // Lazy-require keeps startup fast and avoids issues if pdf-parse's
    // debug-mode self-test path is ever triggered on import.
    const pdfParse = require('pdf-parse');
    const parsed = await pdfParse(file.buffer);
    const cvText: string = (parsed.text || '').trim();

    let updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { cvText },
    });

    try {
      const job = application.job;
      const requiredSkills = Array.isArray(job.requiredSkills) ? (job.requiredSkills as string[]) : [];
      const jobDescription = [job.title, job.responsibilities, job.cultureNotes].filter(Boolean).join('\n');

      const screening = await this.aiService.screenCv({ cvText, jobDescription, requiredSkills });

      updated = await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          aiScore: screening.matchScore,
          aiStrengths: screening.strengths,
          aiGaps: screening.gaps,
          aiExtractedProfile: screening.extraction,
        },
      });
    } catch (error) {
      // Fallback per spec §4.2: CV is stored and recruiter reviews it manually with no AI scoring.
      this.logger.warn(`AI CV screening failed for application ${applicationId}: ${error}`);
    }

    return updated;
  }

  async updateStage(id: string, nextStage: PipelineStage, requester: { userId: string; role: UserRole }) {
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');

    const currentStage = application.stage;
    if (TERMINAL_STAGES.includes(currentStage)) {
      throw new BadRequestException(`Application is already in a terminal stage (${currentStage})`);
    }

    if (nextStage === PipelineStage.REJECTED) {
      if (!REJECT_ROLES.includes(requester.role)) {
        throw new ForbiddenException('Only recruiters or hiring managers can reject a candidate');
      }
    } else {
      const rule = FORWARD_TRANSITIONS[currentStage as PipelineStage];
      if (!rule || rule.to !== nextStage) {
        throw new BadRequestException(`Cannot move an application from ${currentStage} to ${nextStage}`);
      }
      if (!rule.roles.includes(requester.role)) {
        throw new ForbiddenException(`Only ${rule.roles.join(' or ')} can move an application to ${nextStage}`);
      }
    }

    const updated = await this.prisma.application.update({ where: { id }, data: { stage: nextStage } });

    this.gateway.notifyUser(updated.candidateId, 'application:stage-changed', {
      applicationId: updated.id,
      jobId: updated.jobId,
      stage: updated.stage,
    });

    return updated;
  }

  /** Bulk advance/reject multiple candidates in one action (spec §3.3). */
  async bulkUpdateStage(dto: BulkUpdateStageDto, requester: { userId: string; role: UserRole }) {
    const results = [];
    for (const applicationId of dto.applicationIds) {
      try {
        results.push({ applicationId, application: await this.updateStage(applicationId, dto.stage, requester) });
      } catch (error: any) {
        results.push({ applicationId, error: error.message || 'Failed to update stage' });
      }
    }
    return results;
  }
}
