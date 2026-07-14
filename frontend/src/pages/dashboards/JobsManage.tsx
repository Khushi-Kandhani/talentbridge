import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Plus, Briefcase } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

type DashboardShellProps = {
  darkMode: boolean;
  cardClass: string;
  mutedClass: string;
  accentClass: string;
};

type JobPosting = {
  id: string;
  title: string;
  department: string;
  type: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  salaryBand?: string | null;
  requiredSkills: string[];
};

const STATUS_FLOW: Record<JobPosting['status'], JobPosting['status'] | null> = {
  DRAFT: 'PUBLISHED',
  PUBLISHED: 'CLOSED',
  CLOSED: 'ARCHIVED',
  ARCHIVED: null,
};

const STATUS_LABEL: Record<JobPosting['status'], string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
};

function JobsManage({ darkMode, cardClass, mutedClass, accentClass }: DashboardShellProps) {
  const role = useAuthStore((s) => s.role);
  const canCreate = role === 'RECRUITER';

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [type, setType] = useState('full-time');
  const [salaryBand, setSalaryBand] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [cultureNotes, setCultureNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadJobs = () => {
    setLoading(true);
    setLoadError(null);
    api
      .get<JobPosting[]>('/jobs')
      .then((res) => setJobs(res.data))
      .catch((err) => setLoadError(err?.response?.data?.message || 'Could not load job postings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDepartment('');
    setType('full-time');
    setSalaryBand('');
    setRequiredSkills('');
    setResponsibilities('');
    setCultureNotes('');
    setSubmitError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post('/jobs', {
        title,
        department,
        type,
        salaryBand: salaryBand || undefined,
        requiredSkills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        responsibilities: responsibilities || undefined,
        cultureNotes: cultureNotes || undefined,
      });
      resetForm();
      setShowForm(false);
      loadJobs();
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Could not create job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  const advanceStatus = async (job: JobPosting) => {
    const next = STATUS_FLOW[job.status];
    if (!next) return;
    setTransitioning(job.id);
    try {
      await api.patch(`/jobs/${job.id}/status`, { status: next });
      loadJobs();
    } catch (err: any) {
      setLoadError(err?.response?.data?.message || 'Could not update job status.');
    } finally {
      setTransitioning(null);
    }
  };

  const cardBorder = darkMode ? 'border-slate-800' : 'border-slate-200';

  const statusBadgeClass = (status: JobPosting['status']) => {
    switch (status) {
      case 'DRAFT':
        return darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600';
      case 'PUBLISHED':
        return darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700';
      case 'CLOSED':
        return darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700';
      case 'ARCHIVED':
        return darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-700';
    }
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${accentClass}`}>Job postings</p>
          <h2 className="mt-1 text-xl font-semibold">Manage jobs</h2>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus size={16} />
            {showForm ? 'Cancel' : 'New posting'}
          </button>
        )}
      </div>

      {showForm && canCreate && (
        <form onSubmit={handleCreate} className={`mt-6 space-y-4 rounded-2xl border p-5 ${cardBorder}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={`text-sm font-medium ${mutedClass}`}>Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
                placeholder="Senior Frontend Engineer"
              />
            </div>
            <div>
              <label className={`text-sm font-medium ${mutedClass}`}>Department</label>
              <input
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
                placeholder="Engineering"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={`text-sm font-medium ${mutedClass}`}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label className={`text-sm font-medium ${mutedClass}`}>Salary band (optional)</label>
              <input
                value={salaryBand}
                onChange={(e) => setSalaryBand(e.target.value)}
                placeholder="$120k - $160k"
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
              />
            </div>
          </div>

          <div>
            <label className={`text-sm font-medium ${mutedClass}`}>Required skills (comma-separated)</label>
            <input
              required
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="React, TypeScript, Tailwind"
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
            />
          </div>

          <div>
            <label className={`text-sm font-medium ${mutedClass}`}>Responsibilities (optional)</label>
            <textarea
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              rows={3}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
            />
          </div>

          <div>
            <label className={`text-sm font-medium ${mutedClass}`}>Culture notes (optional)</label>
            <textarea
              value={cultureNotes}
              onChange={(e) => setCultureNotes(e.target.value)}
              rows={2}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
            />
          </div>

          {submitError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertTriangle size={16} />
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create posting (starts as Draft)'}
          </button>
        </form>
      )}

      {loading && (
        <div className={`mt-6 flex items-center gap-2 text-sm ${mutedClass}`}>
          <Loader2 size={16} className="animate-spin" />
          Loading job postings…
        </div>
      )}

      {!loading && loadError && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {loadError}
        </div>
      )}

      {!loading && !loadError && jobs.length === 0 && (
        <div className={`mt-6 rounded-xl border p-6 text-sm ${cardBorder} ${mutedClass}`}>
          No job postings yet{canCreate ? ' — create your first one above.' : '.'}
        </div>
      )}

      {!loading && !loadError && jobs.length > 0 && (
        <div className="mt-6 space-y-3">
          {jobs.map((job) => {
            const next = STATUS_FLOW[job.status];
            return (
              <div key={job.id} className={`rounded-xl border p-4 ${cardBorder} ${darkMode ? 'bg-slate-900/60' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase size={16} className={accentClass} />
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className={`text-sm ${mutedClass}`}>
                        {job.department} · {job.type}
                        {job.salaryBand ? ` · ${job.salaryBand}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(job.status)}`}>
                      {STATUS_LABEL[job.status]}
                    </span>
                    {next && (
                      <button
                        onClick={() => advanceStatus(job)}
                        disabled={transitioning === job.id}
                        className="rounded-lg border border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-60"
                      >
                        {transitioning === job.id ? 'Updating…' : `Move to ${STATUS_LABEL[next]}`}
                      </button>
                    )}
                  </div>
                </div>
                {job.requiredSkills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.requiredSkills.map((skill) => (
                      <span key={skill} className={`rounded-full px-2 py-0.5 text-xs ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobsManage;
