import { useEffect, useState } from 'react';
import { BarChart3, Info, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import {
  HiringStagesBarChart,
  HiringFunnelChart,
  SourceEffectivenessPieChart,
  MetricsRadialChart,
} from '../../components/analytics/AnalyticsCharts';

type DashboardShellProps = {
  cardClass: string;
  mutedClass: string;
};

type AnalyticsOverview = {
  summary: { totalApplications: number; openJobs: number; interviewsScheduled: number };
  metrics: { timeToHireDays: number; funnelDropoffRate: number; offerAcceptanceRate: number };
  chartData: { sourceEffectiveness: Array<{ name: string; value: number }>; hiringStages: Array<{ name: string; value: number }> };
};

function AdminDashboard({ cardClass, mutedClass }: DashboardShellProps) {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<AnalyticsOverview>('/analytics/overview')
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <div className={`flex items-center gap-2 text-sm ${mutedClass}`}>
          <Loader2 size={16} className="animate-spin" />
          Loading analytics…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} />
          {error || 'Analytics unavailable.'}
        </div>
      </div>
    );
  }

  const summaryCards = [
    { title: 'Total applications', value: data.summary.totalApplications, hint: 'All time', accent: 'from-brand-500 to-indigo-500' },
    { title: 'Open jobs', value: data.summary.openJobs, hint: 'Currently published', accent: 'from-emerald-500 to-teal-500' },
    { title: 'Interviews scheduled', value: data.summary.interviewsScheduled, hint: 'Upcoming + confirmed', accent: 'from-violet-500 to-fuchsia-500' },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.title} className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
            <div className={`h-24 rounded-2xl bg-gradient-to-r ${card.accent} p-4`}>
              <div className="flex items-center justify-between text-white">
                <span className="text-sm font-medium">Live metric</span>
                <BarChart3 size={18} />
              </div>
              <div className="mt-4 text-3xl font-semibold">{card.value}</div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <h3 className="font-semibold">{card.title}</h3>
              <div className={`flex items-center gap-1 text-sm ${mutedClass}`}>
                <Info size={14} />
                <span>{card.hint}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <HiringStagesBarChart data={data.chartData.hiringStages} cardClass={cardClass} />
        <HiringFunnelChart data={data.chartData.hiringStages} cardClass={cardClass} />
        <SourceEffectivenessPieChart data={data.chartData.sourceEffectiveness} cardClass={cardClass} />
        <MetricsRadialChart
          timeToHireDays={data.metrics.timeToHireDays}
          funnelDropoffRate={data.metrics.funnelDropoffRate}
          offerAcceptanceRate={data.metrics.offerAcceptanceRate}
          cardClass={cardClass}
        />
      </section>
    </div>
  );
}

export default AdminDashboard;
