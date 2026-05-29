import { formatRecordedDate, formatDateTime } from '../utils/format';

export default function ShiftTable({ shifts, onEdit, onDelete, deletingId }) {
  if (!shifts.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
        No entries yet. Click <strong>New Entry</strong> to log your shift handover.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950">
            <tr>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Shift</th>
              <th className="px-3 py-3 text-center">P0–P5</th>
              <th className="px-3 py-3 text-center">Total</th>
              <th className="px-3 py-3 text-center">Esc.</th>
              <th className="px-3 py-3 text-center">Sil.</th>
              <th className="px-3 py-3">Recorded</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {shifts.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-3 py-2.5 whitespace-nowrap">{formatRecordedDate(s.createdAt)}</td>
                <td className="px-3 py-2.5 font-medium">{s.shiftName}</td>
                <td className="px-3 py-2.5 text-center tabular-nums text-xs">
                  {s.p0Count}/{s.p1Count}/{s.p2Count}/{s.p3Count}/{s.p4Count}/{s.p5Count}
                </td>
                <td className="px-3 py-2.5 text-center font-semibold tabular-nums">
                  {s.totalAlerts}
                </td>
                <td className="px-3 py-2.5 text-center tabular-nums">{s.escalatedCount}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">{s.silencedCount}</td>
                <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                  {formatDateTime(s.createdAt)}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(s)}
                      className="rounded px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === s.id}
                      onClick={() => onDelete(s)}
                      className="rounded px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950"
                    >
                      {deletingId === s.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {shifts.map((s) => (
          <article
            key={s.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{s.shiftName}</p>
                <p className="text-xs text-slate-500">{formatRecordedDate(s.createdAt)}</p>
              </div>
              <p className="text-2xl font-bold tabular-nums text-brand-600">{s.totalAlerts}</p>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
              {['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'Esc', 'Sil'].map((lbl, i) => {
                const vals = [
                  s.p0Count,
                  s.p1Count,
                  s.p2Count,
                  s.p3Count,
                  s.p4Count,
                  s.p5Count,
                  s.escalatedCount,
                  s.silencedCount,
                ];
                return (
                  <div key={lbl} className="rounded bg-slate-50 px-1 py-1 dark:bg-slate-800">
                    <span className="text-slate-500">{lbl}</span>
                    <p className="font-semibold tabular-nums">{vals[i]}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-400">{formatDateTime(s.createdAt)}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(s)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm dark:border-slate-700"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={deletingId === s.id}
                onClick={() => onDelete(s)}
                className="flex-1 rounded-lg border border-rose-200 py-2 text-sm text-rose-700 dark:border-rose-900"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
