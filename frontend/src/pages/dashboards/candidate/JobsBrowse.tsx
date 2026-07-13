import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Briefcase, CheckCircle2, Loader2, MapPin, Sparkles } from 'lucide-react';
import api from '../../../lib/api';

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
  salaryBand?: string | null;
  requiredSkills: string[];
  responsibilities?: string | null;
  cultureNotes?: string | null;
};

type Application = {
  id: string;
  jobId: string;
};

type Props = DashboardShellProps & {
  onApplied?: () => void;
};

function JobsBrowse({ darkMode, cardClass, mutedClass, accentClass, onApplied }: Props) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  const [coverLetter, setCoverLetter] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [source, setSource] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([api.get<JobPosting[]>('/jobs'), api.get<Application[]>('/applications')])
      .then(([jobsRes, applicationsRes]) => {
        if (cancelled) return;
        setJobs(jobsRes.data);
        setAppliedJobIds(new Set(applicationsRes.data.map((a) => a.jobId)));
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err?.response?.data?.message || 'Could not load job postings.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setCoverLetter('');
    setYearsOfExperience('');
    setSalaryExpectation('');
    setAvailabilityDate('');
    setSource('');
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const selectJob = (job: JobPosting) => {
    setSelectedJob(job);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post('/applications', {
        jobId: selectedJob.id,
        coverLetter: coverLetter || undefined,
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
        salaryExpectation: salaryExpectation || undefined,
        availabilityDate: availabilityDate || undefined,
        source: source || undefined,
      });
      setSubmitSuccess(true);
      setAppliedJobIds((prev) => new Set(prev).add(selectedJob.id));
      onApplied?.();
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cardBorder = darkMode ? 'border-slate-800' : 'border-slate-200';

  if (loading) {
    return (
      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <div className={`flex items-center gap-2 text-sm ${mutedClass}`}>
          <Loader2 size={16} className="animate-spin" />
          Loading open positions…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} />
          {loadError}
        </div>
      </div>
    );
  }

  if (selectedJob) {
    const alreadyApplied = appliedJobIds.has(selectedJob.id) && !submitSuccess;

    return (
      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <button
          onClick={() => setSelectedJob(null)}
          className={`flex items-center gap-2 text-sm font-medium ${mutedClass} hover:opacity-80`}
        >
          <ArrowLeft size={16} />
          Back to jobs
        </button>

        <div className="mt-4">
          <p className={`text-sm font-medium ${accentClass}`}>{selectedJob.department}</p>
          <h2 className="mt-1 text-xl font-semibold">{selectedJob.title}</h2>
          <div className={`mt-2 flex flex-wrap gap-2 text-sm ${mutedClass}`}>
            <span className="flex items-center gap-1">
              <Briefcase size={14} />
              {selectedJob.type}
            </span>
            {selectedJob.salaryBand && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {selectedJob.salaryBand}
              </span>
            )}
          </div>

          {selectedJob.requiredSkills?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedJob.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {selectedJob.responsibilities && (
            <div className="mt-4">
              <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Responsibilities</p>
              <p className="mt-1 text-sm">{selectedJob.responsibilities}</p>
            </div>
          )}

          {selectedJob.cultureNotes && (
            <div className="mt-4">
              <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Culture</p>
              <p className="mt-1 text-sm">{selectedJob.cultureNotes}</p>
            </div>
          )}
        </div>

        <div className={`mt-6 rounded-2xl border p-5 ${cardBorder}`}>
          {submitSuccess ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 size={18} />
              Application submitted! You can track it from the Overview tab, and upload your CV once it appears there.
            </div>
          ) : alreadyApplied ? (
            <div className={`flex items-center gap-2 text-sm ${mutedClass}`}>
              <CheckCircle2 size={16} className={accentClass} />
              You've already applied to this job — check the Overview tab for your status.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <Sparkles size={16} />
                <h3 className="font-semibold">Apply to this role</h3>
              </div>

              <div>
                <label className={`text-sm font-medium ${mutedClass}`}>Cover letter (optional)</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
                  placeholder="Tell us why you're a great fit…"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`text-sm font-medium ${mutedClass}`}>Years of experience</label>
                  <input
                    type="number"
                    min={0}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
                  />
                </div>
                <div>
                  <label className={`text-sm font-medium ${mutedClass}`}>Salary expectation</label>
                  <input
                    type="text"
                    value={salaryExpectation}
                    onChange={(e) => setSalaryExpectation(e.target.value)}
                    placeholder="$140k"
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-sm font-medium ${mutedClass}`}>Availability date</label>
                <input
                  type="date"
                  value={availabilityDate}
                  onChange={(e) => setAvailabilityDate(e.target.value)}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
                />
              </div>

              <div>
                <label className={`text-sm font-medium ${mutedClass}`}>How did you hear about this role?</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  <option value="">Prefer not to say</option>
                  <option value="DIRECT">Company website / direct</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="JOB_BOARD">Job board</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="OTHER">Other</option>
                </select>
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
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
      <div>
        <p className={`text-sm font-medium ${accentClass}`}>Open positions</p>
        <h2 className="mt-1 text-xl font-semibold">Browse jobs</h2>
      </div>

      {jobs.length === 0 ? (
        <div className={`mt-6 rounded-xl border p-6 text-sm ${cardBorder} ${mutedClass}`}>
          No published job postings right now — check back soon.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => {
            const applied = appliedJobIds.has(job.id);
            return (
              <button
                key={job.id}
                onClick={() => selectJob(job)}
                className={`rounded-2xl border p-4 text-left transition hover:border-brand-400 ${cardBorder} ${darkMode ? 'bg-slate-900/60' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs font-medium ${accentClass}`}>{job.department}</p>
                    <h3 className="mt-1 font-semibold">{job.title}</h3>
                  </div>
                  {applied && (
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                      Applied
                    </span>
                  )}
                </div>
                <div className={`mt-3 flex flex-wrap gap-2 text-xs ${mutedClass}`}>
                  <span>{job.type}</span>
                  {job.salaryBand && <span>· {job.salaryBand}</span>}
                </div>
                {job.requiredSkills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className={`rounded-full px-2 py-0.5 text-xs ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobsBrowse;
