import ExcelJS from 'exceljs';
import { formatIstNow } from './ist.js';
import PDFDocument from 'pdfkit';
import { EXCEL_HEADERS, shiftToExcelRow } from './excelSync.js';

export async function buildExcelBuffer(shifts) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Support Shift Tracker';
  const sheet = workbook.addWorksheet('Shift Entries');

  sheet.addRow(EXCEL_HEADERS);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };

  for (const s of shifts) {
    sheet.addRow(shiftToExcelRow(s));
  }

  sheet.columns.forEach((col) => {
    col.width = 14;
  });
  sheet.getColumn(2).width = 18;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function buildPdfStream(shifts, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  doc.pipe(res);

  doc.fontSize(18).text('Support Shift Tracker — Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${formatIstNow()}`, { align: 'center' });
  doc.moveDown(1.5);

  const colWidths = [30, 70, 55, 35, 35, 35, 35, 35, 35, 55, 50, 50, 55, 55];
  const startX = 40;
  let y = doc.y;

  doc.font('Helvetica-Bold').fontSize(8);
  let x = startX;
  EXCEL_HEADERS.forEach((h, i) => {
    doc.text(h, x, y, { width: colWidths[i], align: 'left' });
    x += colWidths[i];
  });
  y += 14;
  doc.font('Helvetica').fontSize(7);

  for (const s of shifts) {
    if (y > 520) {
      doc.addPage();
      y = 40;
    }
    x = startX;
    const cells = shiftToExcelRow(s).map((v) => String(v ?? ''));
    cells.forEach((cell, i) => {
      doc.text(cell, x, y, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });
    y += 12;
  }

  doc.end();
}
