import { readFile } from "node:fs/promises";
import { getDatabase } from "../lib/database.mjs";
const database = getDatabase();
try {
  await database.query(
    await readFile(new URL("../db/schema.sql", import.meta.url), "utf8"),
  );
  console.log("PostgreSQL tables are ready.");
} finally {
  await database.end();
}
