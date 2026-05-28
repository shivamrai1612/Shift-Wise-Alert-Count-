import StatCard from './StatCard';

export default function Analytics({ analytics }) {
  if (!analytics?.summary) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading analytics…</p>
    );
  }

  const { summary } = analytics;
  const p = summary.priorityTotals;

  const priorities = [
    { label: 'P0', value: p.p0, color: 'bg-red-500', light: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200' },
    { label: 'P1', value: p.p1, color: 'bg-orange-500', light: 'bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200' },
    { label: 'P2', value: p.p2, color: 'bg-yellow-500', light: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' },
    { label: 'P3', value: p.p3, color: 'bg-green-500', light: 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' },
    { label: 'P4', value: p.p4, color: 'bg-blue-500', light: 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200' },
    { label: 'P5', value: p.p5, color: 'bg-violet-500', light: 'bg-violet-50 text-violet-800 dark:bg-violet-950 dark:text-violet-200' },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dashboard</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Alerts" value={summary.totalAlerts} sub={`${summary.entryCount} entries`} />
        <StatCard label="Escalated" value={summary.escalatedTotal} accent="amber" />
        <StatCard label="Silenced" value={summary.silencedTotal} accent="slate" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 text-xs font-medium text-slate-500">Priority breakdown</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {priorities.map(({ label, value, color, light }) => (
            <div
              key={label}
              className={`rounded-lg border border-slate-100 p-3 text-center dark:border-slate-800 ${light}`}
            >
              <div className={`mx-auto mb-2 h-1 w-8 rounded-full ${color}`} />
              <p className="text-xs font-medium opacity-80">{label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          Total P0–P5:{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {summary.totalAlerts}
          </span>
        </p>
      </div>
    </section>
  );
}
