import pool from "./database";

export const ensureTaskSchema = async () => {
  console.log("🔄 Ensuring task schema...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(36) NOT NULL DEFAULT '',
      title VARCHAR(255) NOT NULL,
      description TEXT,
      priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      status VARCHAR(20) DEFAULT 'todo',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "order" INTEGER DEFAULT 0,
      due_date TIMESTAMP,
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      estimated_time INTEGER,
      time_spent INTEGER DEFAULT 0,
      tags TEXT[] DEFAULT ARRAY[]::TEXT[]
    );
  `);

  await pool.query(`
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS device_id VARCHAR(36) NOT NULL DEFAULT '';
  `);

  await pool.query(`
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
  `);

  await pool.query(
    "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);",
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);",
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks("order");',
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS idx_tasks_device_id ON tasks(device_id);",
  );

  console.log("✅ Task schema is ready");
};
