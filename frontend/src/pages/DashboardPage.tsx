import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  Compass,
  LayoutGrid,
  Moon,
  Search,
  Sparkles,
  Sun,
  Users,
  ShieldCheck,
  BarChart3,
  CalendarDays,
} from 'lucide-react';
import CandidateDashboard from './dashboards/CandidateDashboard';
import RecruiterDashboard from './dashboards/RecruiterDashboard';
import HiringManagerDashboard from './dashboards/HiringManagerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

type Role = 'candidate' | 'recruiter' | 'hiring-manager' | 'admin';

type NavItem = {
  id: Role | 'dashboard' | 'jobs' | 'pipeline' | 'analytics';
  label: string;
  icon: typeof LayoutGrid;
  active?: boolean;
};

const sidebarItems: NavItem[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutGrid, active: true },
  { id: 'pipeline', label: 'Pipeline', icon: BriefcaseBusiness },
  { id: 'jobs', label: 'Jobs', icon: Compass },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

function DashboardPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const authRole = useAuthStore((s) => s.role);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = useMemo<Role>(() => {
    switch (authRole) {
      case 'RECRUITER':
        return 'recruiter';
      case 'HIRING_MANAGER':
        return 'hiring-manager';
      case 'ADMIN':
        return 'admin';
      case 'CANDIDATE':
      default:
        return 'candidate';
    }
  }, [authRole]);

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

  const renderRoleView = () => {
    switch (role) {
      case 'candidate':
        return <CandidateDashboard darkMode={darkMode} cardClass={cardClass} mutedClass={mutedClass} accentClass={accentClass} />;
      case 'recruiter':
        return <RecruiterDashboard darkMode={darkMode} cardClass={cardClass} mutedClass={mutedClass} accentClass={accentClass} />;
      case 'hiring-manager':
        return <HiringManagerDashboard darkMode={darkMode} cardClass={cardClass} mutedClass={mutedClass} accentClass={accentClass} />;
      case 'admin':
        return <AdminDashboard cardClass={cardClass} mutedClass={mutedClass} />;
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
                    <button onClick={handleLogout} className={`rounded-xl border px-3 py-2 text-sm font-medium ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-600'}`}>
                      Logout
                    </button>
                  </div>
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

export default DashboardPage;
