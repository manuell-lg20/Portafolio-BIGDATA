const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.warn(
    "ADVERTENCIA: no está definida la variable DATABASE_URL. Configúrala con tu connection string de Neon."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requiere SSL
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS modules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS works (
      id SERIAL PRIMARY KEY,
      module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('file', 'link')),
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      public_id TEXT,
      added_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

module.exports = { pool, initSchema };
