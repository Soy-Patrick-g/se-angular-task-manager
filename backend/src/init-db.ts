import { ensureTaskSchema } from "./config/ensureTaskSchema";

const initDatabase = async () => {
  try {
    await ensureTaskSchema();
    console.log("✅ Database initialization complete");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
};

initDatabase();
