import { Router } from 'express';
import { query } from '../db.js';
import { SHIFT_NAMES } from '../constants.js';
import { rowToShift, validateShiftBody, bodyToDbColumns } from '../utils/shiftHelpers.js';
import { buildExcelBuffer, buildPdfStream } from '../utils/export.js';
import { syncExcelFromDatabaseSafe } from '../utils/excelSync.js';
import { getIstDateString } from '../utils/ist.js';

const router = Router();

function buildWhere(filters) {
  const conditions = [];
  const params = [];
  let i = 1;

  if (filters.date) {
    conditions.push(`entry_date = $${i++}`);
    params.push(filters.date);
  }
  if (filters.shiftName) {
    conditions.push(`shift_name = $${i++}`);
    params.push(filters.shiftName);
  }
  if (filters.dateFrom) {
    conditions.push(`entry_date >= $${i++}`);
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push(`entry_date <= $${i++}`);
    params.push(filters.dateTo);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

async function fetchShifts(filters) {
  const { where, params } = buildWhere(filters);
  const result = await query(
    `SELECT * FROM shift_entries ${where} ORDER BY entry_date DESC, created_at DESC`,
    params
  );
  return result.rows.map(rowToShift);
}

// GET /api/shifts — list with filters
router.get('/', async (req, res, next) => {
  try {
    const shifts = await fetchShifts({
      date: req.query.date,
      shiftName: req.query.shiftName,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    });
    res.json(shifts);
  } catch (err) {
    next(err);
  }
});

// GET /api/shifts/names — allowed shift names
router.get('/names', (_req, res) => {
  res.json(SHIFT_NAMES);
});

// GET /api/shifts/analytics — aggregated stats
router.get('/analytics', async (req, res, next) => {
  try {
    const { where, params } = buildWhere({
      date: req.query.date,
      shiftName: req.query.shiftName,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    });

    const summary = await query(
      `
      SELECT
        COUNT(*)::int AS entry_count,
        COALESCE(SUM(p0_count), 0)::int AS p0_total,
        COALESCE(SUM(p1_count), 0)::int AS p1_total,
        COALESCE(SUM(p2_count), 0)::int AS p2_total,
        COALESCE(SUM(p3_count), 0)::int AS p3_total,
        COALESCE(SUM(p4_count), 0)::int AS p4_total,
        COALESCE(SUM(p5_count), 0)::int AS p5_total,
        COALESCE(SUM(escalated_count), 0)::int AS escalated_total,
        COALESCE(SUM(silenced_count), 0)::int AS silenced_total,
        COALESCE(SUM(
          p0_count + p1_count + p2_count + p3_count + p4_count + p5_count
        ), 0)::int AS total_alerts
      FROM shift_entries
      ${where}
      `,
      params
    );

    const byShift = await query(
      `
      SELECT
        shift_name,
        COUNT(*)::int AS entries,
        COALESCE(SUM(
          p0_count + p1_count + p2_count + p3_count + p4_count + p5_count
        ), 0)::int AS total_alerts,
        COALESCE(SUM(escalated_count), 0)::int AS escalated_total,
        COALESCE(SUM(silenced_count), 0)::int AS silenced_total
      FROM shift_entries
      ${where}
      GROUP BY shift_name
      ORDER BY shift_name
      `,
      params
    );

    const byDate = await query(
      `
      SELECT
        entry_date,
        COALESCE(SUM(
          p0_count + p1_count + p2_count + p3_count + p4_count + p5_count
        ), 0)::int AS total_alerts,
        COALESCE(SUM(escalated_count), 0)::int AS escalated_total,
        COALESCE(SUM(silenced_count), 0)::int AS silenced_total
      FROM shift_entries
      ${where}
      GROUP BY entry_date
      ORDER BY entry_date
      `,
      params
    );

    const row = summary.rows[0];
    res.json({
      summary: {
        entryCount: row.entry_count,
        totalAlerts: row.total_alerts,
        priorityTotals: {
          p0: row.p0_total,
          p1: row.p1_total,
          p2: row.p2_total,
          p3: row.p3_total,
          p4: row.p4_total,
          p5: row.p5_total,
        },
        escalatedTotal: row.escalated_total,
        silencedTotal: row.silenced_total,
      },
      byShift: byShift.rows.map((r) => ({
        shiftName: r.shift_name,
        entries: r.entries,
        totalAlerts: r.total_alerts,
        escalatedTotal: r.escalated_total,
        silencedTotal: r.silenced_total,
      })),
      byDate: byDate.rows.map((r) => ({
        date: r.entry_date,
        totalAlerts: r.total_alerts,
        escalatedTotal: r.escalated_total,
        silencedTotal: r.silenced_total,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/shifts/export/excel
router.get('/export/excel', async (req, res, next) => {
  try {
    const shifts = await fetchShifts({
      date: req.query.date,
      shiftName: req.query.shiftName,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    });
    const buffer = await buildExcelBuffer(shifts);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="shift-report-${stamp}.xlsx"`
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

// GET /api/shifts/export/pdf
router.get('/export/pdf', async (req, res, next) => {
  try {
    const shifts = await fetchShifts({
      date: req.query.date,
      shiftName: req.query.shiftName,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    });
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="shift-report-${stamp}.pdf"`
    );
    buildPdfStream(shifts, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/shifts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM shift_entries WHERE id = $1', [
      req.params.id,
    ]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(rowToShift(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

// POST /api/shifts
router.post('/', async (req, res, next) => {
  try {
    const errors = validateShiftBody(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });

    const {
      shiftName,
      p0Count,
      p1Count,
      p2Count,
      p3Count,
      p4Count,
      p5Count,
      escalatedCount,
      silencedCount,
    } = req.body;

    const result = await query(
      `
      INSERT INTO shift_entries (
        shift_name, p0_count, p1_count, p2_count, p3_count, p4_count, p5_count,
        escalated_count, silenced_count, entry_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
      `,
      [
        String(shiftName).trim(),
        Number(p0Count),
        Number(p1Count),
        Number(p2Count),
        Number(p3Count),
        Number(p4Count),
        Number(p5Count),
        Number(escalatedCount),
        Number(silencedCount),
        req.body.entryDate || getIstDateString(),
      ]
    );

    const created = rowToShift(result.rows[0]);
    await syncExcelFromDatabaseSafe();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /api/shifts/:id
router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateShiftBody(req.body, true);
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });

    const { cols, vals } = bodyToDbColumns(req.body);
    if (!cols.length) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = cols.map((c, idx) => `${c} = $${idx + 2}`).join(', ');
    const result = await query(
      `UPDATE shift_entries SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...vals]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    const updated = rowToShift(result.rows[0]);
    await syncExcelFromDatabaseSafe();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/shifts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM shift_entries WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    await syncExcelFromDatabaseSafe();
    res.json({ success: true, id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
});

export default router;
