import { useState } from 'react';
import { Trash2 } from 'lucide-react';

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
            <h2 className="mt-1 text-xl font-semibold">Ava Chen</h2>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${darkMode ? 'bg-brand-500/15 text-brand-300' : 'bg-brand-50 text-brand-700'}`}>
            Senior Product Designer
          </div>
        </div>
        <div className={`mt-6 rounded-2xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className={`text-sm ${mutedClass}`}>Experience</p>
              <p className="mt-1 font-semibold">8 years</p>
            </div>
            <div>
              <p className={`text-sm ${mutedClass}`}>Location</p>
              <p className="mt-1 font-semibold">Remote · UK</p>
            </div>
            <div>
              <p className={`text-sm ${mutedClass}`}>Skills</p>
              <p className="mt-1 font-semibold">Figma, UX Strategy, Leadership</p>
            </div>
            <div>
              <p className={`text-sm ${mutedClass}`}>Resume</p>
              <p className="mt-1 font-semibold">CV uploaded · 2.3MB</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold">Highlights</h3>
          <ul className={`mt-3 space-y-2 text-sm ${mutedClass}`}>
            <li>• Led a cross-functional design system rollout for 4 product teams.</li>
            <li>• Reduced onboarding friction by 28% through AI-assisted flows.</li>
            <li>• Built scalable research programs across enterprise accounts.</li>
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
