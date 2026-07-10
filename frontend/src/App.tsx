import { useMemo, useState } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  Compass,
  FileUp,
  LayoutGrid,
  Moon,
  Search,
  Sparkles,
  Sun,
  Users,
  WandSparkles,
  ShieldCheck,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleX,
  Grip,
  Trash2,
  Info,
} from 'lucide-react';

type Role = 'candidate' | 'recruiter' | 'hiring-manager' | 'admin';

type Question = {
  id: number;
  text: string;
  category: 'Technical' | 'Behavioral';
};

type NavItem = {
  id: Role | 'dashboard' | 'jobs' | 'pipeline' | 'analytics';
  label: string;
  icon: typeof LayoutGrid;
  active?: boolean;
};

const candidateStages = [
  { label: 'Applied', note: 'Application submitted' },
  { label: 'Screened', note: 'AI CV review in progress' },
  { label: 'Shortlisted', note: 'Recruiter shortlisted you' },
  { label: 'Interview', note: 'Interview scheduled' },
  { label: 'Offer', note: 'Offer delivered' },
  { label: 'Hired/Rejected', note: 'Decision finalized' },
];

const initialQuestions: Question[] = [
  { id: 1, text: 'Describe a time you led a project under ambiguity.', category: 'Behavioral' },
  { id: 2, text: 'How do you approach debugging a production issue?', category: 'Technical' },
  { id: 3, text: 'What metrics would you use to evaluate a new feature?', category: 'Behavioral' },
  { id: 4, text: 'Explain your experience with APIs and integrations.', category: 'Technical' },
];

const sidebarItems: NavItem[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutGrid, active: true },
  { id: 'pipeline', label: 'Pipeline', icon: BriefcaseBusiness },
  { id: 'jobs', label: 'Jobs', icon: Compass },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const roleOptions: Role[] = ['candidate', 'recruiter', 'hiring-manager', 'admin'];

function App() {
  const [role, setRole] = useState<Role>('recruiter');
  const [darkMode, setDarkMode] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isProcessing, setIsProcessing] = useState(false);

  const headerClass = darkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-700 border-slate-200';
  const cardClass = darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700';
  const mutedClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const accentClass = darkMode ? 'text-emerald-400' : 'text-emerald-600';

  const roleBadge = useMemo(() => {
    switch (role) {
      case 'candidate':
        return 'Candidate';
      case 'recruiter':
        return 'Recruiter';
      case 'hiring-manager':
        return 'Hiring Manager';
      default:
        return 'Admin';
    }
  }, [role]);

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

  const renderRoleView = () => {
    switch (role) {
      case 'candidate':
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

      case 'recruiter':
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
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {['Applied', 'Shortlisted', 'Interview'].map((column) => (
                  <div key={column} className={`rounded-2xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">{column}</h3>
                      <span className={`text-sm ${mutedClass}`}>3</span>
                    </div>
                    {['Ava Chen', 'Noah King'].map((name) => (
                      <div key={name} className={`mb-3 rounded-xl border p-3 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{name}</span>
                          <Grip size={16} className={mutedClass} />
                        </div>
                        <p className={`mt-2 text-sm ${mutedClass}`}>Senior Product Designer</p>
                        <div className="mt-3 flex gap-2">
                          <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white">Advance</button>
                          <button className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-600">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
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
                    <span className="text-rose-500">2 conflicts</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {['09:30 - Product Analyst', '14:00 - Engineering Lead'].map((slot) => (
                      <div key={slot} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                        <span>{slot}</span>
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

      case 'hiring-manager':
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

      case 'admin':
        return (
          <section className="grid gap-6 lg:grid-cols-2">
            {[
              {
                title: 'Time-to-Hire per role',
                value: '18 days',
                hint: 'Faster than last quarter',
                accent: 'from-brand-500 to-indigo-500',
              },
              {
                title: 'Funnel drop-off rates',
                value: '24%',
                hint: 'Screening drop-off',
                accent: 'from-amber-400 to-orange-500',
              },
              {
                title: 'Offer acceptance rate',
                value: '82%',
                hint: 'Strong close rate',
                accent: 'from-emerald-500 to-teal-500',
              },
              {
                title: 'Source effectiveness',
                value: '41%',
                hint: 'Referral lead quality',
                accent: 'from-violet-500 to-fuchsia-500',
              },
            ].map((card) => (
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
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Info size={14} />
                    <span>{card.hint}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:p-6">
        <div className={`flex flex-col overflow-hidden rounded-3xl border shadow-soft ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="flex min-h-screen flex-col lg:flex-row">
            <aside className={`w-full border-b p-5 lg:w-72 lg:border-b-0 lg:border-r ${darkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between lg:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white">
                    <BriefcaseBusiness size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">TalentBridge</p>
                    <p className={`text-sm ${mutedClass}`}>AI recruiting OS</p>
                  </div>
                </div>
              </div>

              <nav className="mt-8 space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-white'} ${item.active ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      <span className="flex items-center gap-3">
                        <Icon size={16} />
                        {item.label}
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  );
                })}
              </nav>

              <div className={`mt-8 rounded-2xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">Mina Patel</p>
                    <p className={`text-sm ${mutedClass}`}>Operations Lead</p>
                  </div>
                </div>
                <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                  <ShieldCheck size={14} className={accentClass} />
                  {roleBadge}
                </div>
              </div>
            </aside>

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <header className={`flex flex-col gap-4 rounded-2xl border px-4 py-4 sm:px-6 ${headerClass}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className={`text-sm font-medium ${accentClass}`}>Welcome back</p>
                    <h1 className="text-2xl font-semibold">TalentBridge workspace</h1>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                      <Search size={16} className={mutedClass} />
                      <input className={`bg-transparent text-sm outline-none ${darkMode ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'}`} placeholder="Search candidates" />
                    </label>
                    <button className={`relative rounded-xl border p-2 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                      <Bell size={18} />
                      <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
                    </button>
                    <button onClick={() => setDarkMode((v) => !v)} className={`rounded-xl border p-2 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {roleOptions.map((option) => (
                    <button key={option} onClick={() => setRole(option)} className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${role === option ? 'bg-brand-600 text-white' : (darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600')}`}>
                      {option.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </header>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className={`rounded-2xl border p-4 ${cardClass}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${mutedClass}`}>Active pipeline</p>
                    <BriefcaseBusiness size={16} className={accentClass} />
                  </div>
                  <p className="mt-3 text-2xl font-semibold">128</p>
                  <p className={`mt-1 text-sm ${mutedClass}`}>+12% from last week</p>
                </div>
                <div className={`rounded-2xl border p-4 ${cardClass}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${mutedClass}`}>AI screening</p>
                    <Sparkles size={16} className={accentClass} />
                  </div>
                  <p className="mt-3 text-2xl font-semibold">94%</p>
                  <p className={`mt-1 text-sm ${mutedClass}`}>Auto-match confidence</p>
                </div>
                <div className={`rounded-2xl border p-4 ${cardClass}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${mutedClass}`}>Interview load</p>
                    <CalendarDays size={16} className={accentClass} />
                  </div>
                  <p className="mt-3 text-2xl font-semibold">24</p>
                  <p className={`mt-1 text-sm ${mutedClass}`}>Upcoming this week</p>
                </div>
              </div>

              <div className="mt-6">{renderRoleView()}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
