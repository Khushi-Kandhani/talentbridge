import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <ShieldAlert size={28} />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-800">Access denied</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your account role doesn't have permission to view this page.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Back to your dashboard
        </Link>
      </div>
    </div>
  );
}
