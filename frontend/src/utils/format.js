export function formatDate(d) {
  if (!d) return '—';
  const date = typeof d === 'string' ? d.slice(0, 10) : d;
  return new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
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
