import { Injectable } from '@nestjs/common';
import { Interview, PrismaService } from '../prisma/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateInterviewDto): Promise<Interview> {
    return this.prisma.interview.create({
      data: {
        applicationId: dto.applicationId,
        recruiterId: dto.recruiterId,
        managerId: dto.managerId,
        proposedSlots: dto.proposedSlots ?? [],
        confirmedSlot: dto.confirmedSlot,
        status: dto.status,
        aiQuestions: dto.aiQuestions ?? [],
      },
    });
  }

  async list(): Promise<Interview[]> {
    return this.prisma.interview.findMany();
  }

  async get(id: string): Promise<Interview | null> {
    return this.prisma.interview.findUnique({ where: { id } });
  }
}
