import { useEffect, useRef, useState } from 'react';
import { api, downloadBlob } from '../api/client';
import { formatDateTime } from '../utils/format';

export default function ExcelSync({ refreshKey }) {
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileRef = useRef(null);

  const loadStatus = async () => {
    try {
      const data = await api.getExcelStatus();
      setStatus(data);
    } catch {
      setStatus(null);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [refreshKey]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await api.downloadLiveExcel();
      downloadBlob(blob, 'shift-tracker.xlsx');
      await loadStatus();
    } catch (err) {
      alert(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleRemoveTemplate = async () => {
    if (!window.confirm('Remove your uploaded Excel template?')) return;
    setRemoving(true);
    try {
      await api.removeExcelTemplate();
      await loadStatus();
    } catch (err) {
      alert(err.message || 'Remove failed');
    } finally {
      setRemoving(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadExcelTemplate(file);
      await loadStatus();
      alert('Your Excel template is saved. All data will sync to your layout.');
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (!status?.enabled) return null;

  const last = status.lastSync;
  const syncedLabel = last?.syncedAt ? formatDateTime(last.syncedAt) : 'Not synced yet';

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Excel auto-sync
          </h2>
          <p className="mt-0.5 text-xs text-emerald-800/80 dark:text-emerald-200/80">
            Every entry is saved to the database and written to Excel automatically.
            {status.outputPath && (
              <>
                {' '}
                File: <span className="font-mono text-[10px]">{status.outputPath}</span>
              </>
            )}
            {status.sharePointUrl && (
              <>
                {' '}
                <a
                  href={status.sharePointUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Open SharePoint file
                </a>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
            {last?.rowCount ?? 0} rows · Last sync: {syncedLabel}
            {status.templateExists && ' · Using your custom template'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownload}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {downloading ? 'Downloading…' : 'Download live Excel'}
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900"
          >
            {uploading ? 'Uploading…' : 'Upload your template'}
          </button>
          {status.templateExists && (
            <button
              type="button"
              disabled={removing}
              onClick={handleRemoveTemplate}
              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
            >
              {removing ? 'Removing…' : 'Remove template'}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>
    </div>
  );
}
