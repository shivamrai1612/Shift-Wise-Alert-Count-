/** Map template header text (lowercase) → shift field key */
const HEADER_ALIASES = {
  id: 'id',
  'shift name': 'shiftName',
  shift: 'shiftName',
  region: 'shiftName',
  date: 'entryDate',
  'entry date': 'entryDate',
  p0: 'p0Count',
  p1: 'p1Count',
  p2: 'p2Count',
  p3: 'p3Count',
  p4: 'p4Count',
  p5: 'p5Count',
  'total alerts': 'totalAlerts',
  total: 'totalAlerts',
  escalated: 'escalatedCount',
  silenced: 'silencedCount',
  'created at': 'createdAt',
  created: 'createdAt',
  timestamp: 'createdAt',
  'updated at': 'updatedAt',
  updated: 'updatedAt',
};

export function normalizeHeader(value) {
  if (value == null) return '';
  if (typeof value === 'object' && value.text) return String(value.text).trim().toLowerCase();
  return String(value).trim().toLowerCase();
}

export function detectColumnMap(sheet, headerRowNum) {
  const row = sheet.getRow(headerRowNum);
  const map = [];
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const key = HEADER_ALIASES[normalizeHeader(cell.value)];
    if (key) map[colNumber] = key;
  });
  return map;
}

export function writeShiftToRow(row, shift, columnMap, getValue) {
  for (const [colNumber, field] of Object.entries(columnMap)) {
    const col = Number(colNumber);
    if (field && getValue(shift, field) !== undefined) {
      row.getCell(col).value = getValue(shift, field);
    }
  }
}

export function getShiftFieldValue(shift, field) {
  const values = {
    id: shift.id,
    shiftName: shift.shiftName,
    entryDate: typeof shift.entryDate === 'string' ? shift.entryDate.slice(0, 10) : shift.entryDate,
    p0Count: shift.p0Count,
    p1Count: shift.p1Count,
    p2Count: shift.p2Count,
    p3Count: shift.p3Count,
    p4Count: shift.p4Count,
    p5Count: shift.p5Count,
    totalAlerts: shift.totalAlerts,
    escalatedCount: shift.escalatedCount,
    silencedCount: shift.silencedCount,
    createdAt: shift.createdAt ? new Date(shift.createdAt).toLocaleString() : '',
    updatedAt: shift.updatedAt ? new Date(shift.updatedAt).toLocaleString() : '',
  };
  return values[field];
}
