import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateOfferDto) {
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

  list() {
    return this.prisma.offer.findMany();
  }

  get(id: string) {
    return this.prisma.offer.findUnique({ where: { id } });
  }
}
