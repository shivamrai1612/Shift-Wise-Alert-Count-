import { isValidShiftName } from '../constants.js';

export function rowToShift(row) {
  const totalAlerts =
    row.p0_count +
    row.p1_count +
    row.p2_count +
    row.p3_count +
    row.p4_count +
    row.p5_count;

  return {
    id: row.id,
    shiftName: row.shift_name,
    p0Count: row.p0_count,
    p1Count: row.p1_count,
    p2Count: row.p2_count,
    p3Count: row.p3_count,
    p4Count: row.p4_count,
    p5Count: row.p5_count,
    escalatedCount: row.escalated_count,
    silencedCount: row.silenced_count,
    entryDate: row.entry_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalAlerts,
  };
}

export function validateShiftBody(body, partial = false) {
  const errors = [];
  const fields = [
    'shiftName',
    'p0Count',
    'p1Count',
    'p2Count',
    'p3Count',
    'p4Count',
    'p5Count',
    'escalatedCount',
    'silencedCount',
  ];

  if (!partial) {
    if (!body.shiftName || String(body.shiftName).trim() === '') {
      errors.push('shiftName is required');
    } else if (!isValidShiftName(body.shiftName)) {
      errors.push('shiftName must be one of: APAC, EMEA, US East, US West');
    }
    for (const f of fields.slice(1)) {
      if (body[f] === undefined || body[f] === null || body[f] === '') {
        errors.push(`${f} is required`);
      }
    }
  } else if (
    body.shiftName !== undefined &&
    body.shiftName !== null &&
    body.shiftName !== '' &&
    !isValidShiftName(body.shiftName)
  ) {
    errors.push('shiftName must be one of: APAC, EMEA, US East, US West');
  }

  const counts = [
    'p0Count',
    'p1Count',
    'p2Count',
    'p3Count',
    'p4Count',
    'p5Count',
    'escalatedCount',
    'silencedCount',
  ];

  for (const f of counts) {
    if (body[f] !== undefined && body[f] !== null && body[f] !== '') {
      const n = Number(body[f]);
      if (!Number.isInteger(n) || n < 0) {
        errors.push(`${f} must be a non-negative integer`);
      }
    }
  }

  return errors;
}

export function bodyToDbColumns(body) {
  const map = {
    shiftName: 'shift_name',
    p0Count: 'p0_count',
    p1Count: 'p1_count',
    p2Count: 'p2_count',
    p3Count: 'p3_count',
    p4Count: 'p4_count',
    p5Count: 'p5_count',
    escalatedCount: 'escalated_count',
    silencedCount: 'silenced_count',
    entryDate: 'entry_date',
  };

  const cols = [];
  const vals = [];
  let i = 1;

  for (const [jsKey, dbCol] of Object.entries(map)) {
    if (body[jsKey] !== undefined) {
      cols.push(dbCol);
      vals.push(jsKey === 'shiftName' ? String(body[jsKey]).trim() : body[jsKey]);
    }
  }

  return { cols, vals, placeholders: cols.map(() => `$${i++}`) };
}
