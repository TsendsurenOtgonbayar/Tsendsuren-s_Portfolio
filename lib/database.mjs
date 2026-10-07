import pg from "pg";
let databasePool;
// Нэг Node.js процесс дотор холболтын pool-ийг дахин ашиглана.
export function getDatabase() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured");
  databasePool ??= new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
  return databasePool;
}
