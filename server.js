/**
 * server.js — Mark's Production Tools Backend
 *
 * Stack: Node.js + Express + pg (PostgreSQL)
 * Reads DATABASE_URL from environment — Railway injects this automatically
 * when you add a Postgres addon to your project.
 */

const express = require('express');
const path    = require('path');
const cors    = require('cors');
const { Pool } = require('pg');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));  // payloads can be large stage plots
app.use(express.static(path.join(__dirname, 'public')));

// ─── DATABASE ─────────────────────────────────────────────────────────────────
// Railway sets DATABASE_URL automatically when a Postgres addon is attached.
// Locally, add a .env file with DATABASE_URL=postgres://... and use dotenv,
// or just export the variable in your shell before running node server.js.
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  console.error('   Add a PostgreSQL addon in Railway, or set DATABASE_URL locally.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway Postgres requires SSL in production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create table on first boot if it doesn't exist yet
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id         SERIAL PRIMARY KEY,
      app_type   TEXT        NOT NULL,
      name       TEXT        NOT NULL,
      payload    JSONB       NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('✅ PostgreSQL table ready');
}

// ─── API ROUTES ───────────────────────────────────────────────────────────────

// GET /api/projects?app_type=runsheet
app.get('/api/projects', async (req, res) => {
  const { app_type } = req.query;
  if (!app_type) return res.status(400).json({ error: 'app_type query param required' });
  try {
    const result = await pool.query(
      `SELECT id, name, created_at, updated_at
       FROM projects WHERE app_type = $1
       ORDER BY updated_at DESC`,
      [app_type]
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/projects/:id
app.get('/api/projects/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/projects
app.post('/api/projects', async (req, res) => {
  const { app_type, name, payload } = req.body;
  if (!app_type || !name || !payload)
    return res.status(400).json({ error: 'app_type, name, and payload are required' });
  try {
    const result = await pool.query(
      `INSERT INTO projects (app_type, name, payload)
       VALUES ($1, $2, $3) RETURNING id`,
      [app_type, name, JSON.stringify(payload)]
    );
    res.status(201).json({ id: result.rows[0].id, name, app_type });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/projects/:id
app.put('/api/projects/:id', async (req, res) => {
  const { name, payload } = req.body;
  try {
    await pool.query(
      `UPDATE projects SET
         payload    = COALESCE($1, payload),
         name       = COALESCE($2, name),
         updated_at = NOW()
       WHERE id = $3`,
      [payload ? JSON.stringify(payload) : null, name || null, req.params.id]
    );
    res.json({ success: true, id: Number(req.params.id) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/projects/:id
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── START ────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🎬 Mark's Production Tools running on port ${PORT}\n`);
  });
}).catch(err => {
  console.error('Failed to initialise database:', err);
  process.exit(1);
});
