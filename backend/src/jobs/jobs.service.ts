import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateJobDto) {
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

  list() {
    return this.prisma.jobPosting.findMany({ include: { recruiter: true } });
  }

  get(id: string) {
    return this.prisma.jobPosting.findUnique({ where: { id } });
  }
}
