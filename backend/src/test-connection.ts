import pool from "./config/database";

const testConnection = async () => {
  console.log(
    "Testing connection to:",
    process.env.DATABASE_URL?.split("@")[1],
  );
  try {
    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL");
    const res = await client.query("SELECT NOW()");
    console.log("Current time from DB:", res.rows[0].now);
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection error:", err);
    process.exit(1);
  }
};

testConnection();
