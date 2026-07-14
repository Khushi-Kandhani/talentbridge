import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, UserCog } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore, UserRole } from '../../store/authStore';

type DashboardShellProps = {
  darkMode: boolean;
  cardClass: string;
  mutedClass: string;
  accentClass: string;
};

type ManagedUser = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

const ROLES: UserRole[] = ['CANDIDATE', 'RECRUITER', 'HIRING_MANAGER', 'ADMIN'];

function UsersManage({ darkMode, cardClass, mutedClass, accentClass }: DashboardShellProps) {
  const currentUserEmail = useAuthStore((s) => s.email);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = () => {
    setLoading(true);
    setError(null);
    api
      .get<ManagedUser[]>('/users')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (user: ManagedUser, newRole: UserRole) => {
    if (newRole === user.role) return;
    setUpdatingId(user.id);
    setError(null);
    try {
      await api.patch(`/users/${user.id}/role`, { role: newRole });
      loadUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not update this user\'s role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const cardBorder = darkMode ? 'border-slate-800' : 'border-slate-200';

  if (loading) {
    return (
      <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
        <div className={`flex items-center gap-2 text-sm ${mutedClass}`}>
          <Loader2 size={16} className="animate-spin" />
          Loading users…
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
      <div className="flex items-center gap-2">
        <UserCog size={18} className={accentClass} />
        <h2 className="text-xl font-semibold">User management</h2>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className={`border-b ${cardBorder} ${mutedClass}`}>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Role</th>
              <th className="pb-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={`border-b ${cardBorder}`}>
                <td className="py-3">
                  {user.email}
                  {user.email === currentUserEmail && <span className={`ml-2 text-xs ${mutedClass}`}>(you)</span>}
                </td>
                <td className="py-3">
                  <select
                    value={user.role}
                    disabled={updatingId === user.id || user.email === currentUserEmail}
                    onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                    className={`rounded-lg border px-2 py-1 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'} disabled:opacity-60`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.toLowerCase().replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={`py-3 ${mutedClass}`}>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersManage;
