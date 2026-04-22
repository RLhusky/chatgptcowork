import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import * as schema from "./schema";

const DB_PATH = process.env.APP_DB_PATH ?? join(process.cwd(), "data", "app.db");

declare global {
  // eslint-disable-next-line no-var
  var __app_sqlite: Database.Database | undefined;
}

function openDb() {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return sqlite;
}

export const sqlite = globalThis.__app_sqlite ?? openDb();
if (!globalThis.__app_sqlite) globalThis.__app_sqlite = sqlite;

export const db = drizzle(sqlite, { schema });
export { schema };
