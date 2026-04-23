import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";
import { config } from "dotenv";

config();

const sql = readFileSync("drizzle/0003_rare_sunfire.sql", "utf8");
const statements = sql
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

const conn = await createConnection(process.env.DATABASE_URL);

for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    console.log("✓ Applied:", stmt.substring(0, 60).replace(/\s+/g, " ") + "...");
  } catch (err) {
    if (err.code === "ER_TABLE_EXISTS_ERROR") {
      console.log("⚠ Already exists, skipping:", stmt.substring(0, 60).replace(/\s+/g, " "));
    } else {
      console.error("✗ Error:", err.message);
      process.exit(1);
    }
  }
}

await conn.end();
console.log("Migration complete.");
