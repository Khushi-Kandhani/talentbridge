import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, ArrowRight, X } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore, UserRole } from '../../store/authStore';

type DashboardShellProps = {
  darkMode: boolean;
  cardClass: string;
  mutedClass: string;
  accentClass: string;
};

type PipelineStage = 'APPLIED' | 'SCREENED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFER' | 'HIRED' | 'REJECTED';

type Application = {
  id: string;
  stage: PipelineStage;
  job?: { title?: string };
  candidateId: string;
};

// Mirrors backend FORWARD_TRANSITIONS in applications.service.ts exactly —
// keep in sync if the backend state machine changes.
const FORWARD_TRANSITIONS: Partial<Record<PipelineStage, { to: PipelineStage; roles: UserRole[] }>> = {
  APPLIED: { to: 'SCREENED', roles: ['RECRUITER'] },
  SCREENED: { to: 'SHORTLISTED', roles: ['HIRING_MANAGER'] },
  SHORTLISTED: { to: 'INTERVIEW_SCHEDULED', roles: ['RECRUITER', 'HIRING_MANAGER'] },
  INTERVIEW_SCHEDULED: { to: 'OFFER', roles: ['HIRING_MANAGER'] },
  OFFER: { to: 'HIRED', roles: ['HIRING_MANAGER'] },
};
const REJECT_ROLES: UserRole[] = ['RECRUITER', 'HIRING_MANAGER'];
const TERMINAL_STAGES: PipelineStage[] = ['HIRED', 'REJECTED'];

const COLUMNS: { key: PipelineStage; label: string }[] = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'SCREENED', label: 'Screened' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview' },
  { key: 'OFFER', label: 'Offer' },
  { key: 'HIRED', label: 'Hired' },
  { key: 'REJECTED', label: 'Rejected' },
];

function PipelineBoard({ darkMode, cardClass, mutedClass, accentClass }: DashboardShellProps) {
  const role = useAuthStore((s) => s.role);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const loadApplications = () => {
    setLoading(true);
    setError(null);
    api
      .get<Application[]>('/applications')
      .then((res) => setApplications(res.data))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load the pipeline.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const performTransition = async (application: Application, nextStage: PipelineStage) => {
    setActingOn(application.id);
    try {
      await api.patch(`/applications/${application.id}/stage`, { stage: nextStage });
      loadApplications();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not update this application.');
    } finally {
      setActingOn(null);
    }
  };

  const columnClass = darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50';
  const cardBorder = darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white';

  if (loading) {
    return (
      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <div className={`flex items-center gap-2 text-sm ${mutedClass}`}>
          <Loader2 size={16} className="animate-spin" />
          Loading pipeline…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
      <div>
        <p className={`text-sm font-medium ${accentClass}`}>Candidate pipeline</p>
        <h2 className="mt-1 text-xl font-semibold">Full hiring pipeline</h2>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4 xl:grid-cols-7">
        {COLUMNS.map((column) => {
          const items = applications.filter((a) => a.stage === column.key);
          return (
            <div key={column.key} className={`rounded-2xl border p-3 ${columnClass}`}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{column.label}</h3>
                <span className={`text-xs ${mutedClass}`}>{items.length}</span>
              </div>
              {items.length === 0 ? (
                <div className={`rounded-xl border border-dashed p-2 text-xs ${mutedClass}`}>Empty</div>
              ) : (
                items.map((item) => {
                  const rule = FORWARD_TRANSITIONS[item.stage];
                  const canAdvance = !!rule && role && rule.roles.includes(role);
                  const canReject = !TERMINAL_STAGES.includes(item.stage) && role && REJECT_ROLES.includes(role);
                  return (
                    <div key={item.id} className={`mb-2 rounded-xl border p-2 text-xs ${cardBorder}`}>
                      <p className="font-medium">{item.job?.title || 'Role'}</p>
                      {(canAdvance || canReject) && (
                        <div className="mt-2 flex gap-1">
                          {canAdvance && rule && (
                            <button
                              disabled={actingOn === item.id}
                              onClick={() => performTransition(item, rule.to)}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-white disabled:opacity-60"
                            >
                              <ArrowRight size={12} />
                              Advance
                            </button>
                          )}
                          {canReject && (
                            <button
                              disabled={actingOn === item.id}
                              onClick={() => performTransition(item, 'REJECTED')}
                              className="flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-rose-600 disabled:opacity-60"
                            >
                              <X size={12} />
                              Reject
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PipelineBoard;
