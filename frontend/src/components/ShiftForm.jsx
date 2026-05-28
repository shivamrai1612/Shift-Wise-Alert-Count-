import { useEffect, useState } from 'react';
import { EMPTY_FORM, SHIFT_NAMES } from '../utils/format';

const COUNT_FIELDS = [
  { key: 'p0Count', label: 'P0' },
  { key: 'p1Count', label: 'P1' },
  { key: 'p2Count', label: 'P2' },
  { key: 'p3Count', label: 'P3' },
  { key: 'p4Count', label: 'P4' },
  { key: 'p5Count', label: 'P5' },
  { key: 'escalatedCount', label: 'Escalated' },
  { key: 'silencedCount', label: 'Silenced' },
];

export default function ShiftForm({ open, initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              shiftName: initial.shiftName,
              p0Count: initial.p0Count,
              p1Count: initial.p1Count,
              p2Count: initial.p2Count,
              p3Count: initial.p3Count,
              p4Count: initial.p4Count,
              p5Count: initial.p5Count,
              escalatedCount: initial.escalatedCount,
              silencedCount: initial.silencedCount,
            }
          : { ...EMPTY_FORM }
      );
    }
  }, [open, initial]);

  if (!open) return null;

  const total =
    Number(form.p0Count) +
    Number(form.p1Count) +
    Number(form.p2Count) +
    Number(form.p3Count) +
    Number(form.p4Count) +
    Number(form.p5Count);

  const setCount = (key, val) => {
    const n = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setForm((f) => ({ ...f, [key]: n }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {};
    for (const [k, v] of Object.entries(form)) {
      payload[k] = k === 'shiftName' ? v : Number(v) || 0;
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-form-title"
      >
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="shift-form-title" className="text-lg font-semibold">
              {isEdit ? 'Edit shift entry' : 'New shift entry'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <label className="mb-4 block text-sm">
            <span className="text-slate-600 dark:text-slate-400">Shift Name *</span>
            <select
              required
              value={form.shiftName}
              onChange={(e) => setForm((f) => ({ ...f, shiftName: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-base dark:border-slate-700 dark:bg-slate-950"
              autoFocus
            >
              <option value="" disabled>
                Select shift…
              </option>
              {SHIFT_NAMES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {COUNT_FIELDS.map(({ key, label }) => (
              <label key={key} className="block text-sm">
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  inputMode="numeric"
                  value={form[key]}
                  onChange={(e) => setCount(key, e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-center text-lg font-semibold tabular-nums dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
            ))}
          </div>

          <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-center text-sm font-medium text-brand-800 dark:bg-brand-950 dark:text-brand-200">
            Total alerts (P0–P5): <span className="text-lg font-bold">{total}</span>
          </p>
          <p className="mt-1 text-center text-xs text-slate-500">
            Date &amp; timestamp are saved automatically
          </p>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Save entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
