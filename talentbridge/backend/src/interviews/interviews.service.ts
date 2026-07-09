import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateInterviewDto) {
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

  list() {
    return this.prisma.interview.findMany();
  }

  get(id: string) {
    return this.prisma.interview.findUnique({ where: { id } });
  }
}
