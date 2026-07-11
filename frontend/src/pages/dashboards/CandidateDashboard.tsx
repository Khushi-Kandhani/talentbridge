import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, CircleX, FileUp, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../lib/api';

type DashboardShellProps = {
  darkMode: boolean;
  cardClass: string;
  mutedClass: string;
  accentClass: string;
  onBrowseJobs?: () => void;
};

type JobSummary = {
  id: string;
  title: string;
  department?: string | null;
};

type Application = {
  id: string;
  jobId: string;
  stage: string;
  cvText: string | null;
  aiScore: number | null;
  aiStrengths: string[];
  aiGaps: string[];
  aiExtractedProfile: {
    name?: string;
    yearsOfExperience?: number;
    topSkills?: string[];
    educationLevel?: string;
    lastRole?: string;
  } | null;
  job?: JobSummary;
};

const candidateStages = [
  { key: 'APPLIED', label: 'Applied', note: 'Application submitted' },
  { key: 'SCREENED', label: 'Screened', note: 'AI CV review in progress' },
  { key: 'SHORTLISTED', label: 'Shortlisted', note: 'Recruiter shortlisted you' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview', note: 'Interview scheduled' },
  { key: 'OFFER', label: 'Offer', note: 'Offer delivered' },
  { key: 'HIRED', label: 'Hired/Rejected', note: 'Decision finalized' },
];

function stageIndex(stage: string) {
  if (stage === 'REJECTED') return candidateStages.length - 1;
  const i = candidateStages.findIndex((s) => s.key === stage);
  return i === -1 ? 0 : i;
}

const MAX_CV_BYTES = 5 * 1024 * 1024;

function CandidateDashboard({ darkMode, cardClass, mutedClass, accentClass, onBrowseJobs }: DashboardShellProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    api
      .get<Application[]>('/applications')
      .then((res) => {
        if (cancelled) return;
        setApplications(res.data);
        if (res.data.length > 0) setSelectedId(res.data[0].id);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err?.response?.data?.message || 'Could not load your applications.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedApplication = applications.find((a) => a.id === selectedId) || null;

  const applyUploadResult = (updated: Application) => {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
  };

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') return 'Only PDF files are accepted.';
    if (file.size > MAX_CV_BYTES) return 'CV must be 5MB or smaller.';
    return null;
  };

  const uploadFile = async (file: File) => {
    if (!selectedApplication) return;
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<Application>(`/applications/${selectedApplication.id}/cv`, formData);
      applyUploadResult(res.data);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const dropZoneBorder = dragActive
    ? 'border-brand-500 bg-brand-50/40'
    : darkMode
      ? 'border-slate-700 bg-slate-800/70'
      : 'border-slate-300 bg-slate-50';

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${accentClass}`}>Application progress</p>
            <h2 className="mt-1 text-xl font-semibold">Your hiring journey</h2>
          </div>
          {selectedApplication && (
            <div className={`rounded-full px-3 py-1 text-sm font-medium ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              {selectedApplication.stage.replace(/_/g, ' ')}
            </div>
          )}
        </div>

        {loading && (
          <div className={`mt-8 flex items-center gap-2 text-sm ${mutedClass}`}>
            <Loader2 size={16} className="animate-spin" />
            Loading your applications…
          </div>
        )}

        {!loading && loadError && (
          <div className="mt-8 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertTriangle size={16} />
            {loadError}
          </div>
        )}

        {!loading && !loadError && applications.length === 0 && (
          <div className={`mt-8 rounded-xl border p-6 text-sm ${darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'} ${mutedClass}`}>
            <p>You haven't applied to any jobs yet, so there's nothing to track here.</p>
            <button
              onClick={onBrowseJobs}
              className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Browse jobs
            </button>
          </div>
        )}

        {!loading && !loadError && applications.length > 1 && (
          <div className="mt-6">
            <label className={`text-sm font-medium ${mutedClass}`}>Viewing application for</label>
            <select
              className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.job?.title || a.jobId}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedApplication && (
          <ol className="mt-8 space-y-4">
            {candidateStages.map((stage, index) => {
              const completed = index <= stageIndex(selectedApplication.stage);
              const rejected = selectedApplication.stage === 'REJECTED' && index === candidateStages.length - 1;
              return (
                <li key={stage.key} className="flex items-start gap-4">
                  <div
                    className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
                      rejected
                        ? darkMode
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-rose-100 text-rose-700'
                        : completed
                          ? darkMode
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-emerald-100 text-emerald-700'
                          : darkMode
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {completed || rejected ? <CheckCircle2 size={16} /> : <CircleX size={16} />}
                  </div>
                  <div className="flex-1 rounded-xl border border-slate-200/70 p-4 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{rejected ? 'Rejected' : stage.label}</h3>
                      <span className={`text-sm ${mutedClass}`}>{stage.note}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <div className="flex items-center gap-2 text-emerald-600">
          <FileUp size={18} />
          <h3 className="font-semibold">Upload your CV</h3>
        </div>

        {!selectedApplication ? (
          <p className={`mt-4 text-sm ${mutedClass}`}>
            You'll be able to upload a CV once you have an active application.
          </p>
        ) : (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`mt-6 rounded-2xl border-2 border-dashed p-8 text-center transition ${dropZoneBorder}`}
            >
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-brand-500" />
                ) : (
                  <FileUp size={24} className="text-brand-500" />
                )}
              </div>
              <p className="mt-4 font-semibold">
                {uploading ? 'Uploading and screening…' : 'Drag and drop your PDF'}
              </p>
              <p className={`mt-2 text-sm ${mutedClass}`}>Maximum file size 5MB. PDF only.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {selectedApplication.cvText ? 'Replace file' : 'Select file'}
              </button>
            </div>

            {uploadError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertTriangle size={16} />
                {uploadError}
              </div>
            )}

            <div className={`mt-6 rounded-2xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
              {!selectedApplication.cvText ? (
                <p className={`text-sm ${mutedClass}`}>No CV uploaded yet.</p>
              ) : selectedApplication.aiScore !== null ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">AI CV screening</span>
                    <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                      <Sparkles size={14} />
                      <span>Match score {selectedApplication.aiScore}/100</span>
                    </div>
                  </div>
                  {selectedApplication.aiStrengths?.length > 0 && (
                    <div className="mt-3">
                      <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Strengths</p>
                      <ul className="mt-1 list-inside list-disc text-sm">
                        {selectedApplication.aiStrengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedApplication.aiGaps?.length > 0 && (
                    <div className="mt-3">
                      <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Gaps</p>
                      <ul className="mt-1 list-inside list-disc text-sm">
                        {selectedApplication.aiGaps.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-start gap-2 text-sm">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                  <span className={mutedClass}>
                    Your CV was received, but automated scoring wasn't available. A recruiter will review it manually.
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default CandidateDashboard;
