export const APP_TIMEZONE = 'Asia/Kolkata';

const DATE_OPTIONS = {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

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

function parseDbTimestamp(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return new Date(value.replace(' ', 'T') + 'Z');
  }
  return new Date(value);
}

export function getIstDateString(value = new Date()) {
  const date = parseDbTimestamp(value instanceof Date ? value.toISOString() : value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
}

export function formatIstDate(value) {
  if (!value) return '';
  const date = parseDbTimestamp(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', DATE_OPTIONS);
}

export function formatIstDateTime(value) {
  if (!value) return '';
  const date = parseDbTimestamp(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', DATE_TIME_OPTIONS);
}

export function formatIstNow() {
  return formatIstDateTime(new Date());
}
