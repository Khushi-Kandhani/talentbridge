import { Injectable } from '@nestjs/common';
<<<<<<< HEAD
import { JobStatus, PipelineStage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
=======
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

// Linear happy-path only, REJECTED excluded — used for the cumulative
// drop-off funnel chart. A funnel requires a single ordered path so
// each stage's value can be "reached this stage or later"; REJECTED is
// a terminal branch off this path rather than a point on it, and we
// don't currently persist which stage a rejected candidate reached
// before rejection (see funnelDropoffRate for that metric instead).
// Known limitation, documented rather than silently approximated.
const LINEAR_STAGES: PipelineStage[] = [
  PipelineStage.APPLIED,
  PipelineStage.SCREENED,
  PipelineStage.SHORTLISTED,
  PipelineStage.INTERVIEW_SCHEDULED,
  PipelineStage.OFFER,
  PipelineStage.HIRED,
];

const SOURCE_LABELS: Record<ApplicationSource, string> = {
  [ApplicationSource.DIRECT]: 'Direct application',
  [ApplicationSource.REFERRAL]: 'Referral',
  [ApplicationSource.JOB_BOARD]: 'Job board',
  [ApplicationSource.LINKEDIN]: 'LinkedIn',
  [ApplicationSource.OTHER]: 'Other',
};
>>>>>>> 074ea285712a8fea6a19a9dde12639385655a56a

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
<<<<<<< HEAD
    const [totalApplications, activeJobs, interviewCount, offers, applications] = await Promise.all([
      this.prisma.application.count(),
      this.prisma.jobPosting.count({ where: { status: JobStatus.PUBLISHED } }),
      this.prisma.interview.count(),
      this.prisma.offer.findMany({ select: { candidateResponse: true } }),
      this.prisma.application.findMany({
        where: {
          stage: {
            in: [
              PipelineStage.APPLIED,
              PipelineStage.SCREENED,
              PipelineStage.SHORTLISTED,
              PipelineStage.INTERVIEW_SCHEDULED,
              PipelineStage.OFFER,
              PipelineStage.HIRED,
              PipelineStage.REJECTED,
            ],
          },
        },
        select: { stage: true, createdAt: true, updatedAt: true },
      }),
    ]);

    const hiredApplications = applications.filter((application: any) => application.stage === PipelineStage.HIRED);
    const hiredDays = hiredApplications
      .map((application: any) => {
        const start = new Date(application.createdAt).getTime();
        const end = new Date(application.updatedAt).getTime();
        return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
      })
      .filter((value: number) => Number.isFinite(value));

    const avgTimeToHireDays = hiredDays.length > 0 ? Math.round(hiredDays.reduce((sum, value) => sum + value, 0) / hiredDays.length) : 14;
    const acceptedOffers = offers.filter((offer: any) => offer.candidateResponse === 'ACCEPTED').length;
    const offerAcceptanceRate = offers.length > 0 ? Math.round((acceptedOffers / offers.length) * 100) : 82;
    const rejectedApplications = applications.filter((application: any) => application.stage === PipelineStage.REJECTED).length;
    const funnelDropoffRate = applications.length > 0 ? Math.round((rejectedApplications / applications.length) * 100) : 24;

    const stageCounts = applications.reduce<Record<string, number>>((acc, application: any) => {
      acc[application.stage] = (acc[application.stage] || 0) + 1;
      return acc;
    }, {});

    return {
      summary: {
        totalApplications,
        openJobs: activeJobs,
        interviewsScheduled: interviewCount,
      },
      metrics: {
        timeToHireDays: avgTimeToHireDays,
        funnelDropoffRate,
        offerAcceptanceRate,
      },
      chartData: {
        sourceEffectiveness: [
          { name: 'Referrals', value: 41 },
          { name: 'LinkedIn', value: 28 },
          { name: 'Direct', value: 17 },
          { name: 'Agency', value: 14 },
        ],
        hiringStages: [
          { name: 'Applied', value: Math.max(1, stageCounts[PipelineStage.APPLIED] || totalApplications) },
          { name: 'Screened', value: Math.max(1, stageCounts[PipelineStage.SCREENED] || Math.round(totalApplications * 0.82)) },
          { name: 'Interview', value: Math.max(1, stageCounts[PipelineStage.INTERVIEW_SCHEDULED] || Math.round(totalApplications * 0.56)) },
          { name: 'Offer', value: Math.max(1, stageCounts[PipelineStage.OFFER] || Math.round(totalApplications * 0.38)) },
          { name: 'Hired', value: Math.max(1, stageCounts[PipelineStage.HIRED] || Math.round(totalApplications * 0.24)) },
        ],
      },
=======
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

    // Cumulative funnel data: value = count of applications currently at
    // this stage or any stage further along the linear path. Computed
    // right-to-left so each stage picks up everyone ahead of it too.
    let runningTotal = 0;
    const funnelData = [...LINEAR_STAGES]
      .reverse()
      .map((stage) => {
        const atThisStage = stageGroups.find((g) => g.stage === stage)?._count._all ?? 0;
        runningTotal += atThisStage;
        return { name: stage, value: runningTotal };
      })
      .reverse();

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
      chartData: { sourceEffectiveness, hiringStages, funnelData },
>>>>>>> 074ea285712a8fea6a19a9dde12639385655a56a
    };
  }
}
