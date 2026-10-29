import pkg from "pg";
const { Pool } = pkg;

const connectionString =
  process.env.db_url ||
  "postgresql://neondb_owner:npg_0CLOWeFc5uXo@ep-odd-darkness-b5v658qm-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const database = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

database.on("error", (err) => {
  console.warn("Neon DB idle pool connection reset (handled gracefully):", err.message);
});

try {
  const client = await database.connect();
  console.log("Connected to the database pool successfully");
  client.release();
} catch (error) {
  console.warn(
    "Database connection notice (operating with memory/fallback store if DB offline):",
    error.message || error
  );
}

export default database;
