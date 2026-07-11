import { CheckCircle2, CircleX, FileUp, Sparkles } from 'lucide-react';

type DashboardShellProps = {
  darkMode: boolean;
  cardClass: string;
  mutedClass: string;
  accentClass: string;
};

const candidateStages = [
  { label: 'Applied', note: 'Application submitted' },
  { label: 'Screened', note: 'AI CV review in progress' },
  { label: 'Shortlisted', note: 'Recruiter shortlisted you' },
  { label: 'Interview', note: 'Interview scheduled' },
  { label: 'Offer', note: 'Offer delivered' },
  { label: 'Hired/Rejected', note: 'Decision finalized' },
];

function CandidateDashboard({ darkMode, cardClass, mutedClass, accentClass }: DashboardShellProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${accentClass}`}>Application progress</p>
            <h2 className="mt-1 text-xl font-semibold">Your hiring journey</h2>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
            In review
          </div>
        </div>
        <ol className="mt-8 space-y-4">
          {candidateStages.map((stage, index) => {
            const completed = index < 3;
            return (
              <li key={stage.label} className="flex items-start gap-4">
                <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${completed ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                  {completed ? <CheckCircle2 size={16} /> : <CircleX size={16} />}
                </div>
                <div className="flex-1 rounded-xl border border-slate-200/70 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{stage.label}</h3>
                    <span className={`text-sm ${mutedClass}`}>{stage.note}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <div className="flex items-center gap-2 text-emerald-600">
          <FileUp size={18} />
          <h3 className="font-semibold">Upload your CV</h3>
        </div>
        <div className={`mt-6 rounded-2xl border-2 border-dashed p-8 text-center ${darkMode ? 'border-slate-700 bg-slate-800/70' : 'border-slate-300 bg-slate-50'}`}>
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <FileUp size={24} className="text-brand-500" />
          </div>
          <p className="mt-4 font-semibold">Drag and drop your PDF</p>
          <p className={`mt-2 text-sm ${mutedClass}`}>Maximum file size 5MB. PDF only.</p>
          <button className="mt-5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
            Select file
          </button>
        </div>
        <div className={`mt-6 rounded-2xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">AI CV screening</span>
            <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
              <Sparkles size={14} />
              <span>Match score 87/100</span>
            </div>
          </div>
          <p className={`mt-2 text-sm ${mutedClass}`}>Our AI model will assess relevance, seniority, and experience fit.</p>
        </div>
      </div>
    </section>
  );
}

export default CandidateDashboard;
