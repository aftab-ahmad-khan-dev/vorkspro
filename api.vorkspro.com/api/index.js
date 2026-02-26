/**
 * Vercel serverless entry.
 * Ensures DB is connected on first request, then forwards to Express app.
 */
import app from '../src/app.js';
import initializeDatabase from '../src/database/database.js';

let dbReady = null;
async function ensureDb() {
  if (dbReady === null) {
    dbReady = initializeDatabase().then(
      () => {},
      (err) => { console.error('DB init error:', err?.message); throw err; }
    );
  }
  await dbReady;
}

export default async function handler(req, res) {
  try {
    await ensureDb();
  } catch (err) {
    console.error('Serverless DB init failed:', err?.message || err);
    res.status(503).setHeader('Content-Type', 'application/json').end(
      JSON.stringify({ ok: false, error: 'Service temporarily unavailable', message: 'Database connection failed.' })
    );
    return;
  }
  return app(req, res);
}
