import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JobStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

/** Draft -> Published -> Closed -> Archived (spec §3.2). No skipping stages or going backward, except Closed -> Archived. */
const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  DRAFT: [JobStatus.PUBLISHED],
  PUBLISHED: [JobStatus.CLOSED],
  CLOSED: [JobStatus.ARCHIVED],
  ARCHIVED: [],
};

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateJobDto, recruiterId: string) {
    return this.prisma.jobPosting.create({
      data: {
        title: dto.title,
        department: dto.department,
        type: dto.type,
        salaryBand: dto.salaryBand,
        requiredSkills: dto.requiredSkills,
        responsibilities: dto.responsibilities,
        cultureNotes: dto.cultureNotes,
        recruiterId,
        status: JobStatus.DRAFT,
      },
    });
  }

  /** Published jobs are visible to everyone; draft/closed/archived are internal-only (spec §3.2). */
  list(requester: { userId: string; role: UserRole }) {
    if (requester.role === UserRole.CANDIDATE) {
      return this.prisma.jobPosting.findMany({ where: { status: JobStatus.PUBLISHED }, include: { recruiter: true } });
    }
    return this.prisma.jobPosting.findMany({ include: { recruiter: true } });
  }

  async get(id: string, requester: { userId: string; role: UserRole }) {
    const job = await this.prisma.jobPosting.findUnique({ where: { id }, include: { recruiter: true } });
    if (!job) throw new NotFoundException('Job posting not found');
    if (requester.role === UserRole.CANDIDATE && job.status !== JobStatus.PUBLISHED) {
      throw new NotFoundException('Job posting not found');
    }
    return job;
  }

  async updateStatus(id: string, nextStatus: JobStatus, requester: { userId: string; role: UserRole }) {
    const job = await this.prisma.jobPosting.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job posting not found');

    if (requester.role === UserRole.RECRUITER && job.recruiterId !== requester.userId) {
      throw new ForbiddenException('You can only update your own job postings');
    }

    if (!ALLOWED_TRANSITIONS[job.status as JobStatus].includes(nextStatus)) {
      throw new BadRequestException(`Cannot move a job posting from ${job.status} to ${nextStatus}`);
    }

    return this.prisma.jobPosting.update({ where: { id }, data: { status: nextStatus } });
  }
}
