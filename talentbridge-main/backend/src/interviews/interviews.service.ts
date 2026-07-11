import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InterviewStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TalentBridgeGateway } from '../gateway/talent-bridge.gateway';
import { CreateInterviewDto } from './dto/create-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: TalentBridgeGateway,
  ) {}

  create(dto: CreateInterviewDto) {
    return this.prisma.interview.create({
      data: {
        applicationId: dto.applicationId,
        recruiterId: dto.recruiterId,
        managerId: dto.managerId,
        proposedSlots: dto.proposedSlots ?? [],
        status: InterviewStatus.PENDING,
      },
    });
  }

  list(requester: { userId: string; role: UserRole }) {
    if (requester.role === UserRole.CANDIDATE) {
      return this.prisma.interview.findMany({
        where: { application: { candidateId: requester.userId } },
      });
    }
    return this.prisma.interview.findMany();
  }

  async get(id: string, requester: { userId: string; role: UserRole }) {
    const interview = await this.prisma.interview.findUnique({ where: { id }, include: { application: true } });
    if (!interview) throw new NotFoundException('Interview not found');
    if (requester.role === UserRole.CANDIDATE && interview.application.candidateId !== requester.userId) {
      throw new ForbiddenException('You can only view your own interviews');
    }
    return interview;
  }

  /**
   * Candidate confirms one of the proposed slots (or requests an alternative
   * by passing a slot not in the proposed list). Detects conflicts against
   * any other CONFIRMED interview for the same hiring manager (spec §3.5).
   */
  async confirmSlot(id: string, slot: string, requester: { userId: string; role: UserRole }) {
    const interview = await this.prisma.interview.findUnique({ where: { id }, include: { application: true } });
    if (!interview) throw new NotFoundException('Interview not found');

    if (requester.role === UserRole.CANDIDATE && interview.application.candidateId !== requester.userId) {
      throw new ForbiddenException('You can only confirm your own interview');
    }

    const conflict = await this.prisma.interview.findFirst({
      where: {
        id: { not: id },
        managerId: interview.managerId,
        status: InterviewStatus.CONFIRMED,
        confirmedSlot: slot,
      },
    });
    if (conflict) {
      throw new BadRequestException('This slot conflicts with another confirmed interview for this hiring manager');
    }

    const wasProposed = (interview.proposedSlots as string[]).includes(slot);
    const updated = await this.prisma.interview.update({
      where: { id },
      data: {
        confirmedSlot: slot,
        status: InterviewStatus.CONFIRMED,
        // If the candidate requested a slot that wasn't originally proposed, keep it visible for the recruiter to see.
        proposedSlots: wasProposed
          ? interview.proposedSlots
          : [...(interview.proposedSlots as string[]), slot],
      },
    });

    this.gateway.notifyUser(interview.recruiterId, 'interview:confirmed', { interviewId: id, slot });
    this.gateway.notifyUser(interview.managerId, 'interview:confirmed', { interviewId: id, slot });

    return updated;
  }

  /** Saves the hiring manager's final (possibly edited/reordered) AI-generated question list (spec §4.3). */
  async setQuestions(id: string, questions: string[]) {
    const interview = await this.prisma.interview.findUnique({ where: { id } });
    if (!interview) throw new NotFoundException('Interview not found');
    return this.prisma.interview.update({ where: { id }, data: { aiQuestions: questions } });
  }
}
