import express from 'express';
import cors from 'cors';
import { initDb, dbMode } from './db.js';
import shiftsRouter from './routes/shifts.js';
import excelRouter from './routes/excel.js';
import { syncExcelFromDatabaseSafe } from './utils/excelSync.js';

export async function createApp() {
  await initDb();

  if (process.env.VERCEL !== '1') {
    await syncExcelFromDatabaseSafe();
  }

  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN;
  app.use(
    cors(
      corsOrigin
        ? { origin: corsOrigin.split(',').map((o) => o.trim()) }
        : { origin: true }
    )
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      database: dbMode,
      platform: process.env.VERCEL === '1' ? 'vercel' : 'local',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/shifts', shiftsRouter);
  app.use('/api/excel', excelRouter);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
