import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  FunnelChart,
  Funnel,
  LabelList,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';

export type ChartDatum = { name: string; value: number };

const BRAND = '#4338ca';
const BRAND_LIGHT = '#4f46e5';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';
const VIOLET = '#8b5cf6';

const PALETTE = [BRAND, EMERALD, AMBER, VIOLET, '#0ea5e9', '#ec4899'];

type ChartShellProps = {
  title: string;
  darkMode?: boolean;
  cardClass: string;
  children: React.ReactNode;
};

function ChartShell({ title, cardClass, children }: ChartShellProps) {
  return (
    <div className={`rounded-2xl border p-6 shadow-soft ${cardClass}`}>
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

/** Chart 1: Bar chart — hiring stage counts */
export function HiringStagesBarChart({ data, cardClass }: { data: ChartDatum[]; cardClass: string }) {
  return (
    <ChartShell title="Hiring funnel (by stage)" cardClass={cardClass}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill={BRAND} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

/** Chart 2: Funnel chart — same stage data, funnel-shaped visualization of drop-off */
export function HiringFunnelChart({ data, cardClass }: { data: ChartDatum[]; cardClass: string }) {
  const funnelData = data.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }));
  return (
    <ChartShell title="Candidate drop-off funnel" cardClass={cardClass}>
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip />
          <Funnel dataKey="value" data={funnelData} isAnimationActive>
            <LabelList dataKey="name" position="right" fill="#334155" stroke="none" fontSize={12} />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

/** Chart 3: Pie/donut chart — source effectiveness breakdown */
export function SourceEffectivenessPieChart({ data, cardClass }: { data: ChartDatum[]; cardClass: string }) {
  return (
    <ChartShell title="Channel effectiveness" cardClass={cardClass}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip />
          <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: 12 }} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={data.length > 1 ? 2 : 0}
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

/** Chart 4: Radial gauge chart — top-level metrics (time-to-hire, drop-off, offer acceptance) */
export function MetricsRadialChart({
  timeToHireDays,
  funnelDropoffRate,
  offerAcceptanceRate,
  cardClass,
}: {
  timeToHireDays: number;
  funnelDropoffRate: number;
  offerAcceptanceRate: number;
  cardClass: string;
}) {
  // Normalize time-to-hire onto a 0-100 scale for the gauge (assume 60 days is a practical ceiling);
  // the raw day count is still shown as a label, this is just the gauge fill.
  const timeToHirePct = Math.min(100, Math.round((timeToHireDays / 60) * 100));

  const data = [
    { name: 'Time-to-Hire', value: timeToHirePct, raw: `${timeToHireDays}d`, fill: BRAND_LIGHT },
    { name: 'Funnel drop-off', value: funnelDropoffRate, raw: `${funnelDropoffRate}%`, fill: AMBER },
    { name: 'Offer acceptance', value: offerAcceptanceRate, raw: `${offerAcceptanceRate}%`, fill: EMERALD },
  ];

  return (
    <ChartShell title="Key metrics" cardClass={cardClass}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={data}
          innerRadius="30%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={14}
        >
          <RadialBar background dataKey="value" cornerRadius={8} />
          <Legend
            iconSize={10}
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(_value, entry) => {
              const payload = (entry as { payload?: { name: string; raw: string } }).payload;
              return payload ? `${payload.name}: ${payload.raw}` : '';
            }}
          />
          <Tooltip />
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
