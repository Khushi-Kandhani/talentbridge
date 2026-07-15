import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { firstName, lastName, email, password });
      login(res.data.accessToken, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const msg = typeof raw === 'string' ? raw : raw?.message;
      setError(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-2">
          <UserPlus size={20} className="text-brand-600" />
          <h1 className="text-xl font-semibold">Create your account</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-600">First name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
                placeholder="Lionel"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-600">Last name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
                placeholder="Messi"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
              placeholder="At least 8 characters"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
