import { BarChart3, Info } from 'lucide-react';

type DashboardShellProps = {
  cardClass: string;
  mutedClass: string;
};

function AdminDashboard({ cardClass, mutedClass }: DashboardShellProps) {
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
            <div className={`flex items-center gap-1 text-sm ${mutedClass}`}>
              <Info size={14} />
              <span>{card.hint}</span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default AdminDashboard;
