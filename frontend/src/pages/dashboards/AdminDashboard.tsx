import { useEffect, useState } from 'react';
import { BarChart3, Info, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';

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

  const cards = [
    { title: 'Time-to-Hire', value: `${data.metrics.timeToHireDays} days`, hint: 'Average from application to hire', accent: 'from-brand-500 to-indigo-500' },
    { title: 'Funnel drop-off', value: `${data.metrics.funnelDropoffRate}%`, hint: 'Rejected or stalled stages', accent: 'from-amber-400 to-orange-500' },
    { title: 'Offer acceptance', value: `${data.metrics.offerAcceptanceRate}%`, hint: 'Candidate response rate', accent: 'from-emerald-500 to-teal-500' },
    { title: 'Source effectiveness', value: `${data.chartData.sourceEffectiveness[0].value}%`, hint: 'Best channel this period', accent: 'from-violet-500 to-fuchsia-500' },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
            <div className={`h-28 rounded-2xl bg-gradient-to-r ${card.accent} p-4`}>
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
        <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
          <h3 className="font-semibold">Hiring funnel</h3>
          <div className="mt-4 space-y-3">
            {data.chartData.hiringStages.map((stage) => (
              <div key={stage.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{stage.name}</span>
                  <span className={mutedClass}>{stage.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.min(100, stage.value * 4)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
          <h3 className="font-semibold">Channel effectiveness</h3>
          <div className="mt-4 space-y-3">
            {data.chartData.sourceEffectiveness.map((source) => (
              <div key={source.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{source.name}</span>
                  <span className={mutedClass}>{source.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${source.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
