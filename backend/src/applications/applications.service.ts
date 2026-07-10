import { Injectable } from '@nestjs/common';
import { Application, PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateApplicationDto): Promise<Application> {
    return this.prisma.application.create({
      data: {
        jobId: dto.jobId,
        candidateId: dto.candidateId,
        coverLetter: dto.coverLetter,
        yearsOfExperience: dto.yearsOfExperience,
        salaryExpectation: dto.salaryExpectation,
        availabilityDate: dto.availabilityDate,
        cvText: dto.cvText,
        aiScore: dto.aiScore,
        aiStrengths: dto.aiStrengths ?? [],
        aiGaps: dto.aiGaps ?? [],
        stage: dto.stage,
      },
    });
  }

  async list(): Promise<Application[]> {
    return this.prisma.application.findMany();
  }

  async get(id: string): Promise<Application | null> {
    return this.prisma.application.findUnique({ where: { id } });
  }
}
