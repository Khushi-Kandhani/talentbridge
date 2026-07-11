import { CalendarDays, Grip, WandSparkles } from 'lucide-react';

type DashboardShellProps = {
  darkMode: boolean;
  cardClass: string;
  mutedClass: string;
  accentClass: string;
};

function RecruiterDashboard({ darkMode, cardClass, mutedClass, accentClass }: DashboardShellProps) {
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
}

export default RecruiterDashboard;
