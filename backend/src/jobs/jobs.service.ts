import { Injectable } from '@nestjs/common';
import { JobPosting, PrismaService, User } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateJobDto): Promise<JobPosting> {
    return this.prisma.jobPosting.create({
      data: {
        title: dto.title,
        department: dto.department,
        type: dto.type,
        salaryBand: dto.salaryBand,
        requiredSkills: dto.requiredSkills,
        responsibilities: dto.responsibilities,
        cultureNotes: dto.cultureNotes,
        recruiterId: dto.recruiterId,
        status: dto.status,
      },
    });
  }

  async list(): Promise<(JobPosting & { recruiter: User })[]> {
    return this.prisma.jobPosting.findMany({ include: { recruiter: true } });
  }

  async get(id: string): Promise<JobPosting | null> {
    return this.prisma.jobPosting.findUnique({ where: { id } });
  }
}
