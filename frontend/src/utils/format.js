export const APP_TIMEZONE = 'Asia/Kolkata';

const DATE_TIME_OPTIONS = {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZoneName: 'short',
};

const DATE_OPTIONS = {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

/** Parse DB timestamps (SQLite UTC strings or ISO from PostgreSQL). */
function parseDbTimestamp(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return new Date(value.replace(' ', 'T') + 'Z');
  }
  return new Date(value);
}

export function formatDate(d) {
  if (!d) return '—';
  const iso = typeof d === 'string' ? d.slice(0, 10) : d;
  const [y, m, day] = iso.split('-').map(Number);
  if (!y || !m || !day) return '—';
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString('en-IN', DATE_OPTIONS);
}

/** Date portion of recorded time (IST) — matches Recorded column date. */
export function formatRecordedDate(d) {
  if (!d) return '—';
  const date = parseDbTimestamp(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', DATE_OPTIONS);
}

export function formatDateTime(d) {
  if (!d) return '—';
  const date = parseDbTimestamp(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', DATE_TIME_OPTIONS);
}

export const EMPTY_FORM = {
  shiftName: '',
  p0Count: 0,
  p1Count: 0,
  p2Count: 0,
  p3Count: 0,
  p4Count: 0,
  p5Count: 0,
  escalatedCount: 0,
  silencedCount: 0,
};

export const SHIFT_NAMES = ['APAC', 'EMEA', 'US East', 'US West'];
