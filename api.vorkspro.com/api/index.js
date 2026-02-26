/**
 * Vercel serverless entry.
 * Ensures DB is connected on first request, then forwards to Express app.
 */
import app from '../src/app.js';
import initializeDatabase from '../src/database/database.js';

let dbReady = null;
async function ensureDb() {
  if (dbReady === null) dbReady = initializeDatabase().catch((err) => { console.error('DB init error:', err.message); });
  await dbReady;
}

export default async function handler(req, res) {
  await ensureDb();
  return app(req, res);
}
