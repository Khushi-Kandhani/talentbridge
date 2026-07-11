import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OfferCandidateResponse, UserRole } from '@prisma/client';
import { OffersService } from '../offers.service';

describe('OffersService.respond', () => {
  let prisma: any;
  let gateway: any;
  let service: OffersService;

  beforeEach(() => {
    prisma = {
      offer: { findUnique: jest.fn(), update: jest.fn() },
      application: { findUnique: jest.fn() },
    };
    gateway = { notifyUser: jest.fn() };
    service = new OffersService(prisma, gateway);
  });

  it('rejects a response to an offer that has not been approved by the recruiter yet', async () => {
    prisma.offer.findUnique.mockResolvedValue({
      id: 'o1',
      applicationId: 'a1',
      isApprovedByRecruiter: false,
      application: { candidateId: 'cand1' },
    });

    await expect(
      service.respond('o1', { response: OfferCandidateResponse.ACCEPTED }, 'cand1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a response from someone who is not the candidate on the offer', async () => {
    prisma.offer.findUnique.mockResolvedValue({
      id: 'o1',
      applicationId: 'a1',
      isApprovedByRecruiter: true,
      application: { candidateId: 'cand1' },
    });

    await expect(
      service.respond('o1', { response: OfferCandidateResponse.ACCEPTED }, 'someone-else'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('records the response and notifies the owning recruiter in real time', async () => {
    prisma.offer.findUnique.mockResolvedValue({
      id: 'o1',
      applicationId: 'a1',
      isApprovedByRecruiter: true,
      application: { candidateId: 'cand1' },
    });
    prisma.offer.update.mockResolvedValue({ id: 'o1', candidateResponse: OfferCandidateResponse.NEGOTIATED });
    prisma.application.findUnique.mockResolvedValue({ id: 'a1', job: { recruiterId: 'rec1' } });

    const result = await service.respond(
      'o1',
      { response: OfferCandidateResponse.NEGOTIATED, counterText: 'Can we go higher?' },
      'cand1',
    );

    expect(result.candidateResponse).toBe(OfferCandidateResponse.NEGOTIATED);
    expect(gateway.notifyUser).toHaveBeenCalledWith('rec1', 'offer:responded', expect.any(Object));
  });
});
