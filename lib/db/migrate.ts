import { sqlite } from "./client";

const DDL = [
  `CREATE TABLE IF NOT EXISTS setting (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS project (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    instructions TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'folder',
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  )`,

  `CREATE TABLE IF NOT EXISTS chat (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'New chat',
    project_id TEXT REFERENCES project(id) ON DELETE SET NULL,
    model TEXT NOT NULL,
    reasoning_effort TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  )`,
  `CREATE INDEX IF NOT EXISTS chat_updated_idx ON chat(updated_at)`,
  `CREATE INDEX IF NOT EXISTS chat_project_idx ON chat(project_id)`,

  `CREATE TABLE IF NOT EXISTS message (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    attachments TEXT,
    citations TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  )`,
  `CREATE INDEX IF NOT EXISTS message_chat_idx ON message(chat_id, created_at)`,

  `CREATE TABLE IF NOT EXISTS knowledge_file (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    text_extracted TEXT,
    chunk_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  )`,

  `CREATE TABLE IF NOT EXISTS knowledge_chunk (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL REFERENCES knowledge_file(id) ON DELETE CASCADE,
    ord INTEGER NOT NULL,
    content TEXT NOT NULL,
    tokens INTEGER NOT NULL DEFAULT 0,
    embedding BLOB NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS chunk_file_idx ON knowledge_chunk(file_id)`,

  `CREATE TABLE IF NOT EXISTS project_file (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    file_id TEXT NOT NULL REFERENCES knowledge_file(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS integration (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'disconnected',
    meta TEXT
  )`,
];

export function runMigrations() {
  sqlite.exec("BEGIN");
  try {
    for (const stmt of DDL) sqlite.exec(stmt);
    sqlite.exec("COMMIT");
  } catch (err) {
    sqlite.exec("ROLLBACK");
    throw err;
  }
}

if (require.main === module) {
  runMigrations();
  console.log("migrations applied");
}
