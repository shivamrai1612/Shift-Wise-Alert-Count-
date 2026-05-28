import { useCallback, useEffect, useState } from 'react';
import { api, downloadBlob } from './api/client';
import Header from './components/Header';
import Filters from './components/Filters';
import Analytics from './components/Analytics';
import ShiftForm from './components/ShiftForm';
import ShiftTable from './components/ShiftTable';
import ExcelSync from './components/ExcelSync';

const EMPTY_FILTERS = { date: '', dateFrom: '', dateTo: '', shiftName: '' };

export default function App() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [shifts, setShifts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [excelRefreshKey, setExcelRefreshKey] = useState(0);

  const queryFilters = useCallback(() => {
    const q = {};
    if (filters.date) q.date = filters.date;
    if (filters.dateFrom) q.dateFrom = filters.dateFrom;
    if (filters.dateTo) q.dateTo = filters.dateTo;
    if (filters.shiftName) q.shiftName = filters.shiftName;
    return q;
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = queryFilters();
      const [list, stats] = await Promise.all([
        api.getShifts(q),
        api.getAnalytics(q),
      ]);
      setShifts(list);
      setAnalytics(stats);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [queryFilters]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (payload) => {
    setSaving(true);
    setError('');
    try {
      if (editing?.id) {
        await api.updateShift(editing.id, payload);
      } else {
        await api.createShift(payload);
      }
      setFormOpen(false);
      setEditing(null);
      await load();
      setExcelRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (shift) => {
    if (!window.confirm(`Delete ${shift.shiftName} entry from ${shift.entryDate}?`)) return;
    setDeletingId(shift.id);
    try {
      await api.deleteShift(shift.id);
      await load();
      setExcelRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const q = queryFilters();
      const stamp = new Date().toISOString().slice(0, 10);
      if (type === 'excel') {
        const blob = await api.exportExcel(q);
        downloadBlob(blob, `shift-report-${stamp}.xlsx`);
      } else {
        const blob = await api.exportPdf(q);
        downloadBlob(blob, `shift-report-${stamp}.pdf`);
      }
    } catch (err) {
      setError(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        onNewEntry={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
          >
            {error}
            <button
              type="button"
              onClick={() => setError('')}
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <ExcelSync refreshKey={excelRefreshKey} />

        <Filters
          filters={filters}
          onChange={setFilters}
          onExport={handleExport}
          exporting={exporting}
        />

        {loading ? (
          <p className="text-center text-sm text-slate-500">Loading…</p>
        ) : (
          <>
            <Analytics analytics={analytics} />
            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Shift entries
              </h2>
              <ShiftTable
                shifts={shifts}
                onEdit={(s) => {
                  setEditing(s);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            </section>
          </>
        )}
      </main>

      <ShiftForm
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
