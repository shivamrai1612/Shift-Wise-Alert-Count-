import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import {
  getExcelOutputPath,
  getExcelTemplatePath,
  getLastExcelSync,
  syncExcelFromDatabase,
} from '../utils/excelSync.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(__dirname, '../../../excel');

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
      cb(null, TEMPLATE_DIR);
    },
    filename: (_req, _file, cb) => {
      cb(null, 'custom-template.xlsx');
    },
  }),
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.endsWith('.xlsx');
    cb(ok ? null : new Error('Only .xlsx files are allowed'), ok);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// GET /api/excel/status
router.get('/status', (_req, res) => {
  const outputPath = getExcelOutputPath();
  const templatePath = getExcelTemplatePath();
  const lastSync = getLastExcelSync();
  res.json({
    enabled: process.env.EXCEL_SYNC_ENABLED !== 'false',
    outputPath,
    templatePath,
    templateExists: fs.existsSync(templatePath),
    outputExists: fs.existsSync(outputPath),
    sharePointUrl: process.env.SHAREPOINT_EXCEL_URL || null,
    lastSync,
  });
});

// GET /api/excel/download — live synced workbook
router.get('/download', async (_req, res, next) => {
  try {
    await syncExcelFromDatabase();
    const filePath = getExcelOutputPath();
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Excel file not found' });
    }
    res.download(filePath, path.basename(filePath));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/excel/template — remove uploaded custom template
router.delete('/template', async (_req, res, next) => {
  try {
    const templatePath = getExcelTemplatePath();
    if (fs.existsSync(templatePath)) {
      fs.unlinkSync(templatePath);
    }
    const info = await syncExcelFromDatabase();
    res.json({
      message: 'Uploaded template removed.',
      lastSync: info,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/excel/template — upload your custom Excel template
router.post('/template', upload.single('file'), async (req, res, next) => {
  try {
    if (process.env.VERCEL === '1') {
      return res.status(400).json({
        error: 'Template upload is not available on Vercel. Use Export Excel to download reports.',
      });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
    }
    const info = await syncExcelFromDatabase();
    res.json({
      message: 'Template uploaded. Excel file regenerated with your layout.',
      templatePath: req.file.path,
      lastSync: info,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
