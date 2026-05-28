import 'dotenv/config';
import serverless from 'serverless-http';
import { createApp } from '../backend/src/app.js';

let handler;

export default async function vercelHandler(req, res) {
  if (!handler) {
    const app = await createApp();
    handler = serverless(app, {
      binary: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf',
        'application/octet-stream',
      ],
    });
  }
  return handler(req, res);
}
