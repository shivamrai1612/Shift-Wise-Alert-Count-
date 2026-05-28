import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../db.js';
import { rowToShift } from './shiftHelpers.js';
import {
  detectColumnMap,
  getShiftFieldValue,
  writeShiftToRow,
} from './excelColumnMap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

export const EXCEL_HEADERS = [
  'ID',
  'Shift Name',
  'Date',
  'P0',
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
  'Total Alerts',
  'Escalated',
  'Silenced',
  'Created At',
  'Updated At',
];

export function shiftToExcelRow(s) {
  return EXCEL_HEADERS.map((_, i) => {
    const fields = [
      'id',
      'shiftName',
      'entryDate',
      'p0Count',
      'p1Count',
      'p2Count',
      'p3Count',
      'p4Count',
      'p5Count',
      'totalAlerts',
      'escalatedCount',
      'silencedCount',
      'createdAt',
      'updatedAt',
    ];
    return getShiftFieldValue(s, fields[i]);
  });
}

export function getExcelOutputPath() {
  const configured = process.env.EXCEL_OUTPUT_PATH || 'data/shift-tracker.xlsx';
  return path.isAbsolute(configured)
    ? configured
    : path.join(PROJECT_ROOT, configured);
}

export function getExcelTemplatePath() {
  const configured =
    process.env.EXCEL_TEMPLATE_PATH || 'excel/custom-template.xlsx';
  return path.isAbsolute(configured)
    ? configured
    : path.join(PROJECT_ROOT, configured);
}

export function isExcelSyncEnabled() {
  if (process.env.VERCEL === '1') return false;
  return process.env.EXCEL_SYNC_ENABLED !== 'false';
}

let lastSync = null;

export function getLastExcelSync() {
  return lastSync;
}

async function fetchAllShifts() {
  const result = await query(
    `SELECT * FROM shift_entries ORDER BY entry_date DESC, created_at DESC`
  );
  return result.rows.map(rowToShift);
}

function styleHeaderRow(sheet, rowNumber) {
  const row = sheet.getRow(rowNumber);
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
}

function applyColumnWidths(sheet) {
  const widths = [8, 14, 12, 8, 8, 8, 8, 8, 8, 12, 10, 10, 20, 20];
  widths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });
}

function clearDataRows(sheet, fromRow) {
  const last = sheet.rowCount;
  for (let r = last; r >= fromRow; r--) {
    if (sheet.getRow(r).hasValues) {
      sheet.spliceRows(r, 1);
    }
  }
}

function writeDataRowsDefault(sheet, shifts, startRow) {
  shifts.forEach((shift, idx) => {
    const row = sheet.getRow(startRow + idx);
    shiftToExcelRow(shift).forEach((val, colIdx) => {
      row.getCell(colIdx + 1).value = val;
    });
  });
}

function writeDataRowsMapped(sheet, shifts, startRow, columnMap) {
  shifts.forEach((shift, idx) => {
    const row = sheet.getRow(startRow + idx);
    writeShiftToRow(row, shift, columnMap, getShiftFieldValue);
  });
}

function resolveSheet(workbook) {
  const sheetName = process.env.EXCEL_DATA_SHEET;
  if (sheetName) {
    const named = workbook.getWorksheet(sheetName);
    if (named) return named;
  }
  return workbook.worksheets[0];
}

async function buildWorkbook(shifts) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Support Shift Tracker';
  workbook.created = new Date();

  const templatePath = getExcelTemplatePath();
  const headerRow = Number(process.env.EXCEL_HEADER_ROW || 1);
  const dataStartRow = Number(process.env.EXCEL_DATA_START_ROW || 2);

  if (fs.existsSync(templatePath)) {
    await workbook.xlsx.readFile(templatePath);
    let sheet = resolveSheet(workbook);
    if (!sheet) {
      sheet = workbook.addWorksheet(process.env.EXCEL_DATA_SHEET || 'Shift Data');
    }

    const columnMap = detectColumnMap(sheet, headerRow);
    const hasMappedColumns = Object.keys(columnMap).length > 0;

    if (!hasMappedColumns) {
      sheet.getRow(headerRow).values = [null, ...EXCEL_HEADERS];
      styleHeaderRow(sheet, headerRow);
      clearDataRows(sheet, dataStartRow);
      writeDataRowsDefault(sheet, shifts, dataStartRow);
    } else {
      clearDataRows(sheet, dataStartRow);
      writeDataRowsMapped(sheet, shifts, dataStartRow, columnMap);
    }

    applyColumnWidths(sheet);
    return workbook;
  }

  const sheet = workbook.addWorksheet(process.env.EXCEL_DATA_SHEET || 'Shift Data');
  sheet.addRow(EXCEL_HEADERS);
  styleHeaderRow(sheet, 1);
  writeDataRowsDefault(sheet, shifts, 2);
  applyColumnWidths(sheet);
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  return workbook;
}

/** Regenerate Excel file from all database records */
export async function syncExcelFromDatabase() {
  if (!isExcelSyncEnabled()) return lastSync;

  const shifts = await fetchAllShifts();
  const templatePath = getExcelTemplatePath();
  const outputPath = getExcelOutputPath();
  const writePath = fs.existsSync(templatePath) ? outputPath : outputPath;

  const dir = path.dirname(writePath);
  fs.mkdirSync(dir, { recursive: true });

  const workbook = await buildWorkbook(shifts);
  await workbook.xlsx.writeFile(writePath);

  lastSync = {
    path: writePath,
    rowCount: shifts.length,
    syncedAt: new Date().toISOString(),
    usedTemplate: fs.existsSync(templatePath),
    sharePointUrl: process.env.SHAREPOINT_EXCEL_URL || null,
  };

  console.log(`Excel synced: ${writePath} (${shifts.length} rows)`);
  return lastSync;
}

export async function syncExcelFromDatabaseSafe() {
  try {
    return await syncExcelFromDatabase();
  } catch (err) {
    console.error('Excel sync failed:', err.message);
    return null;
  }
}
