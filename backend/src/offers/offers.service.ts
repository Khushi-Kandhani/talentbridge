import { Injectable } from '@nestjs/common';
import { Offer, PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateOfferDto): Promise<Offer> {
    return this.prisma.offer.create({
      data: {
        applicationId: dto.applicationId,
        managerId: dto.managerId,
        roleTitle: dto.roleTitle,
        salary: dto.salary,
        startDate: dto.startDate,
        probationPeriod: dto.probationPeriod,
        benefits: dto.benefits,
        candidateResponse: dto.candidateResponse,
        counterText: dto.counterText,
        isApprovedByRecruiter: dto.isApprovedByRecruiter,
      },
    });
  }

  async list(): Promise<Offer[]> {
    return this.prisma.offer.findMany();
  }

  async get(id: string): Promise<Offer | null> {
    return this.prisma.offer.findUnique({ where: { id } });
  }
}
