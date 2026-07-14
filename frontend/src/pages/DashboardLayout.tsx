import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../store/authStore';
import { useSocket } from '../useSocket';
import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  Compass,
  LayoutGrid,
  Moon,
  Search,
  Sun,
  Users,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

export type DashboardOutletContext = {
  darkMode: boolean;
  cardClass: string;
  mutedClass: string;
  accentClass: string;
};

type NavItem = {
  to: string;
  end?: boolean;
  label: string;
  icon: typeof LayoutGrid;
  roles: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', end: true, label: 'Overview', icon: LayoutGrid, roles: ['CANDIDATE', 'RECRUITER', 'HIRING_MANAGER', 'ADMIN'] },
  { to: '/dashboard/jobs', label: 'Jobs', icon: Compass, roles: ['CANDIDATE', 'RECRUITER', 'ADMIN'] },
  { to: '/dashboard/pipeline', label: 'Pipeline', icon: BriefcaseBusiness, roles: ['RECRUITER', 'HIRING_MANAGER'] },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN'] },
  { to: '/dashboard/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const authRole = useAuthStore((s) => s.role);
  const [darkMode, setDarkMode] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, connectionError } = useSocket();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNavItems = NAV_ITEMS.filter((item) => authRole && item.roles.includes(authRole));

  const roleBadge = (() => {
    switch (authRole) {
      case 'RECRUITER':
        return 'Recruiter';
      case 'HIRING_MANAGER':
        return 'Hiring Manager';
      case 'ADMIN':
        return 'Admin';
      case 'CANDIDATE':
      default:
        return 'Candidate';
    }
  })();

  const headerClass = darkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-700 border-slate-200';
  const cardClass = darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700';
  const mutedClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const accentClass = darkMode ? 'text-emerald-400' : 'text-emerald-600';

  const outletContext: DashboardOutletContext = { darkMode, cardClass, mutedClass, accentClass };

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
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                          darkMode ? 'hover:bg-slate-800' : 'hover:bg-white'
                        } ${isActive ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300'}`
                      }
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} />
                        {item.label}
                      </span>
                      <ChevronRight size={16} />
                    </NavLink>
                  );
                })}
              </nav>

              <div className={`mt-8 rounded-2xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">{authRole ? authRole.toLowerCase().replace(/_/g, ' ') : 'Team member'}</p>
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
                    <div className="relative">
                      <button
                        onClick={() => setNotifOpen((v) => !v)}
                        className={`relative rounded-xl border p-2 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}
                      >
                        <Bell size={18} />
                        {!notifOpen && notifications.length > 0 && (
                          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
                        )}
                      </button>
                      {notifOpen && (
                        <div
                          className={`absolute right-0 top-full z-10 mt-2 w-72 rounded-xl border p-2 shadow-soft ${
                            darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                          }`}
                        >
                          {connectionError && (
                            <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                              {connectionError}
                            </div>
                          )}
                          {notifications.length === 0 ? (
                            <p className={`p-2 text-sm ${mutedClass}`}>No notifications yet.</p>
                          ) : (
                            <ul className="space-y-1">
                              {notifications.map((n) => (
                                <li
                                  key={n.id}
                                  className={`rounded-lg px-2 py-2 text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}
                                >
                                  {n.message}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                    <button onClick={() => setDarkMode((v) => !v)} className={`rounded-xl border p-2 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button onClick={handleLogout} className={`rounded-xl border px-3 py-2 text-sm font-medium ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-600'}`}>
                      Logout
                    </button>
                  </div>
                </div>
              </header>

              <div className="mt-6">
                <Outlet context={outletContext} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
