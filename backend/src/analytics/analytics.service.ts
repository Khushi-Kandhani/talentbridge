import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationSource, JobStatus, PipelineStage } from '@prisma/client';

const STAGE_ORDER: PipelineStage[] = [
  PipelineStage.APPLIED,
  PipelineStage.SCREENED,
  PipelineStage.SHORTLISTED,
  PipelineStage.INTERVIEW_SCHEDULED,
  PipelineStage.OFFER,
  PipelineStage.HIRED,
  PipelineStage.REJECTED,
];

const SOURCE_LABELS: Record<ApplicationSource, string> = {
  [ApplicationSource.DIRECT]: 'Direct application',
  [ApplicationSource.REFERRAL]: 'Referral',
  [ApplicationSource.JOB_BOARD]: 'Job board',
  [ApplicationSource.LINKEDIN]: 'LinkedIn',
  [ApplicationSource.OTHER]: 'Other',
};

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [totalApplications, openJobs, interviewsScheduled, allApplications, offers, stageGroups, sourceGroups] =
      await Promise.all([
        this.prisma.application.count(),
        this.prisma.jobPosting.count({ where: { status: JobStatus.PUBLISHED } }),
        this.prisma.interview.count({ where: { confirmedSlot: { not: null } } }),
        this.prisma.application.findMany({
          where: { stage: PipelineStage.HIRED },
          select: { createdAt: true, updatedAt: true },
        }),
        this.prisma.offer.findMany({ select: { candidateResponse: true } }),
        this.prisma.application.groupBy({ by: ['stage'], _count: { _all: true } }),
        this.prisma.application.groupBy({ by: ['source'], _count: { _all: true } }),
      ]);

    // Time-to-hire: average days between application creation and the
    // most recent update for applications currently in the HIRED stage.
    // NOTE: this is an approximation — we don't yet store a dedicated
    // "hiredAt" timestamp, so updatedAt is used as a proxy. Worth a
    // dedicated timestamp column if this metric needs to be exact.
    const timeToHireDays =
      allApplications.length === 0
        ? 0
        : Math.round(
            allApplications.reduce((sum, app) => {
              const days = (app.updatedAt.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / allApplications.length,
          );

    const rejectedCount = stageGroups.find((g) => g.stage === PipelineStage.REJECTED)?._count._all ?? 0;
    const funnelDropoffRate = totalApplications === 0 ? 0 : Math.round((rejectedCount / totalApplications) * 100);

    const respondedOffers = offers.filter((o) => o.candidateResponse !== null);
    const acceptedOffers = offers.filter((o) => o.candidateResponse === 'ACCEPTED');
    const offerAcceptanceRate =
      respondedOffers.length === 0 ? 0 : Math.round((acceptedOffers.length / respondedOffers.length) * 100);

    const hiringStages = STAGE_ORDER.map((stage) => ({
      name: stage,
      value: stageGroups.find((g) => g.stage === stage)?._count._all ?? 0,
    }));

    // Real source-effectiveness: percentage of total applications per
    // channel, computed from the Application.source field (backed by the
    // add_application_source migration + the "How did you hear about this
    // role?" field on the candidate apply form).
    const sourceEffectiveness =
      totalApplications === 0
        ? []
        : sourceGroups.map((g) => ({
            name: SOURCE_LABELS[g.source],
            value: Math.round((g._count._all / totalApplications) * 100),
          }));

    return {
      summary: { totalApplications, openJobs, interviewsScheduled },
      metrics: { timeToHireDays, funnelDropoffRate, offerAcceptanceRate },
      chartData: { sourceEffectiveness, hiringStages },
    };
  }
}
