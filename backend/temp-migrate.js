const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  try {
    console.log("Starting DB migration...");
    await pool.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS device_id VARCHAR(36) NOT NULL DEFAULT '';
    `);
    console.log("✅ Migration: device_id column ensured");

    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_tasks_device_id ON tasks(device_id);"
    );
    console.log("✅ Indexes created successfully");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

runMigration();
