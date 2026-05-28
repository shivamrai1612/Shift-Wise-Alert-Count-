/**
 * Vercel Services entrypoint (Express).
 * Routes are mounted without /api prefix — Vercel adds routePrefix /api.
 */
import { createApp } from './src/app.js';

const app = await createApp();
export default app;
