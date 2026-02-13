import pool from "./config/database";

const initDatabase = async () => {
  try {
    console.log("🔄 Initializing database...");

    // Create users table first
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createUsersTableQuery);
    console.log("✅ Users table created successfully");

    // Create tasks table with user_id reference
    const createTasksTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "order" INTEGER DEFAULT 0,
        due_date TIMESTAMP,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        estimated_time INTEGER,
        time_spent INTEGER DEFAULT 0,
        tags TEXT[],
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await pool.query(createTasksTableQuery);
    console.log("✅ Tasks table created successfully");

    // Create indexes for better performance
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);",
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);",
    );
    await pool.query(
      'CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks("order");',
    );

    console.log("✅ Indexes created successfully");
    console.log("✅ Database initialization complete");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
};

initDatabase();
