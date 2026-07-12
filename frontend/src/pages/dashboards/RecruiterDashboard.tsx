import { useEffect, useState } from 'react';
import { CalendarDays, Grip, WandSparkles, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';

type DashboardShellProps = {
  darkMode: boolean;
  cardClass: string;
  mutedClass: string;
  accentClass: string;
};

type PipelineItem = {
  id: string;
  stage: string;
  job?: { title?: string };
  candidate?: { email?: string };
};

function RecruiterDashboard({ darkMode, cardClass, mutedClass, accentClass }: DashboardShellProps) {
  const [applications, setApplications] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PipelineItem[]>('/applications')
      .then((res) => setApplications(res.data))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load candidates.'))
      .finally(() => setLoading(false));
  }, []);

  const grouped = {
    APPLIED: applications.filter((item) => item.stage === 'APPLIED'),
    SCREENED: applications.filter((item) => item.stage === 'SCREENED'),
    SHORTLISTED: applications.filter((item) => item.stage === 'SHORTLISTED' || item.stage === 'INTERVIEW_SCHEDULED'),
  };

  return (
    <section className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${accentClass}`}>Pipeline board</p>
            <h2 className="mt-1 text-xl font-semibold">Candidate pipeline</h2>
          </div>
          <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            Bulk actions
          </button>
        </div>

        {loading && (
          <div className={`mt-6 flex items-center gap-2 text-sm ${mutedClass}`}>
            <Loader2 size={16} className="animate-spin" />
            Loading pipeline…
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {Object.entries(grouped).map(([column, items]) => (
              <div key={column} className={`rounded-2xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">{column.replace(/_/g, ' ')}</h3>
                  <span className={`text-sm ${mutedClass}`}>{items.length}</span>
                </div>
                {items.length === 0 ? (
                  <div className={`rounded-xl border border-dashed p-3 text-sm ${mutedClass}`}>No candidates here yet.</div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className={`mb-3 rounded-xl border p-3 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.candidate?.email || 'Candidate'}</span>
                        <Grip size={16} className={mutedClass} />
                      </div>
                      <p className={`mt-2 text-sm ${mutedClass}`}>{item.job?.title || 'Open role'}</p>
                      <div className="mt-3 flex gap-2">
                        <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white">Advance</button>
                        <button className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-600">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${accentClass}`}>Interview scheduling</p>
              <h3 className="mt-1 font-semibold">Calendar overview</h3>
            </div>
            <CalendarDays size={18} className={accentClass} />
          </div>
          <div className={`mt-6 rounded-2xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Today</span>
              <span className="text-rose-500">{Math.max(0, applications.length - 2)} upcoming</span>
            </div>
            <div className="mt-4 space-y-2">
              {applications.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                  <span>{item.job?.title || 'Interview slot'}</span>
                  <span className="text-amber-500">Needs review</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
          <div className="flex items-center gap-2">
            <WandSparkles size={18} className={accentClass} />
            <h3 className="font-semibold">AI job description generator</h3>
          </div>
          <div className="mt-4 space-y-3">
            <input className={`w-full rounded-xl border px-3 py-2 outline-none ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`} placeholder="Senior Frontend Engineer" />
            <textarea className={`min-h-24 w-full rounded-xl border px-3 py-2 outline-none ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`} placeholder="Describe the role, stack, and ideal candidate profile." />
            <button className="w-full rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Generate draft</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RecruiterDashboard;
