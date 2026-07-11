import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TalentBridgeGateway } from '../gateway/talent-bridge.gateway';
import { CreateOfferDto } from './dto/create-offer.dto';
import { RespondOfferDto } from './dto/respond-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: TalentBridgeGateway,
  ) {}

  create(dto: CreateOfferDto, managerId: string) {
    return this.prisma.offer.create({
      data: {
        applicationId: dto.applicationId,
        managerId,
        roleTitle: dto.roleTitle,
        salary: dto.salary,
        startDate: dto.startDate,
        probationPeriod: dto.probationPeriod,
        benefits: dto.benefits,
        isApprovedByRecruiter: false,
      },
    });
  }

  list(requester: { userId: string; role: UserRole }) {
    if (requester.role === UserRole.CANDIDATE) {
      return this.prisma.offer.findMany({ where: { application: { candidateId: requester.userId } } });
    }
    return this.prisma.offer.findMany();
  }

  async get(id: string, requester: { userId: string; role: UserRole }) {
    const offer = await this.prisma.offer.findUnique({ where: { id }, include: { application: true } });
    if (!offer) throw new NotFoundException('Offer not found');
    if (requester.role === UserRole.CANDIDATE && offer.application.candidateId !== requester.userId) {
      throw new ForbiddenException('You can only view your own offer');
    }
    return offer;
  }

  /** Recruiter must explicitly approve an offer before it can be sent (spec §4.4). */
  async approve(id: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    return this.prisma.offer.update({ where: { id }, data: { isApprovedByRecruiter: true } });
  }

  /** Candidate accepts, rejects, or negotiates; recruiter is notified instantly (spec §3.6). */
  async respond(id: string, dto: RespondOfferDto, candidateId: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id }, include: { application: true } });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.application.candidateId !== candidateId) {
      throw new ForbiddenException('You can only respond to your own offer');
    }
    if (!offer.isApprovedByRecruiter) {
      throw new BadRequestException('This offer has not been approved for sending yet');
    }

    const updated = await this.prisma.offer.update({
      where: { id },
      data: { candidateResponse: dto.response, counterText: dto.counterText },
    });

    // Notify every recruiter that handled the underlying application's job posting.
    const application = await this.prisma.application.findUnique({
      where: { id: offer.applicationId },
      include: { job: true },
    });
    if (application) {
      this.gateway.notifyUser(application.job.recruiterId, 'offer:responded', {
        offerId: id,
        response: dto.response,
        counterText: dto.counterText,
      });
    }

    return updated;
  }
}
