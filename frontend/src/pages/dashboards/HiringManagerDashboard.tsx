import { useEffect, useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';

type DashboardShellProps = {
  darkMode: boolean;
  cardClass: string;
  mutedClass: string;
  accentClass: string;
};

type Question = {
  id: number;
  text: string;
  category: 'Technical' | 'Behavioral';
};

const initialQuestions: Question[] = [
  { id: 1, text: 'Describe a time you led a project under ambiguity.', category: 'Behavioral' },
  { id: 2, text: 'How do you approach debugging a production issue?', category: 'Technical' },
  { id: 3, text: 'What metrics would you use to evaluate a new feature?', category: 'Behavioral' },
  { id: 4, text: 'Explain your experience with APIs and integrations.', category: 'Technical' },
];

function HiringManagerDashboard({ darkMode, cardClass, mutedClass, accentClass }: DashboardShellProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/applications')
      .then((res) => setActivity(res.data.slice(0, 4)))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load hiring activity.'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateQuestions = () => {
    setIsProcessing(true);
    window.setTimeout(() => {
      setQuestions((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: 'What would make this candidate a strong long-term hire?',
          category: 'Behavioral',
        },
      ]);
      setIsProcessing(false);
    }, 900);
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${accentClass}`}>Candidate profile</p>
            <h2 className="mt-1 text-xl font-semibold">Hiring activity</h2>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${darkMode ? 'bg-brand-500/15 text-brand-300' : 'bg-brand-50 text-brand-700'}`}>
            Live pipeline
          </div>
        </div>
        {loading && (
          <div className={`mt-6 flex items-center gap-2 text-sm ${mutedClass}`}>
            <Loader2 size={16} className="animate-spin" />
            Loading activity…
          </div>
        )}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}
        {!loading && !error && (
          <div className={`mt-6 rounded-2xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                  <div className="font-medium">{item.job?.title || 'Role'}</div>
                  <div className={`mt-1 ${mutedClass}`}>Stage: {item.stage}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6">
          <h3 className="font-semibold">Highlights</h3>
          <ul className={`mt-3 space-y-2 text-sm ${mutedClass}`}>
            <li>• Review the latest candidate activity from the shared pipeline.</li>
            <li>• Keep interview plans aligned with recruiter updates and offer status.</li>
            <li>• Use the AI question suggestions to prepare concise, structured interviews.</li>
          </ul>
        </div>
      </div>

      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${accentClass}`}>AI interview suggester</p>
            <h2 className="mt-1 text-xl font-semibold">Interview question plan</h2>
          </div>
          <button onClick={handleGenerateQuestions} className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white">
            Add question
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {questions.map((question) => (
            <div key={question.id} className={`flex items-start justify-between rounded-xl border p-3 ${darkMode ? 'border-slate-800 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
              <div>
                <p className="font-medium">{question.text}</p>
                <p className={`mt-1 text-sm ${mutedClass}`}>{question.category}</p>
              </div>
              <button onClick={() => handleRemoveQuestion(question.id)} className="rounded-lg p-2 hover:bg-slate-200 dark:hover:bg-slate-700">
                <Trash2 size={16} className="text-rose-500" />
              </button>
            </div>
          ))}
          {isProcessing && (
            <div className={`rounded-xl border border-dashed p-4 ${darkMode ? 'border-slate-700 bg-slate-800/70' : 'border-slate-300 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                <span className="text-sm">Generating a tailored follow-up question...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HiringManagerDashboard;
