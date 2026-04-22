import {
  sqliteTable,
  text,
  integer,
  blob,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const setting = sqliteTable("setting", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const project = sqliteTable("project", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  instructions: text("instructions").notNull().default(""),
  icon: text("icon").notNull().default("folder"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const chat = sqliteTable(
  "chat",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull().default("New chat"),
    projectId: text("project_id").references(() => project.id, {
      onDelete: "set null",
    }),
    model: text("model").notNull(),
    reasoningEffort: text("reasoning_effort"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    byUpdated: index("chat_updated_idx").on(t.updatedAt),
    byProject: index("chat_project_idx").on(t.projectId),
  })
);

export const message = sqliteTable(
  "message",
  {
    id: text("id").primaryKey(),
    chatId: text("chat_id")
      .notNull()
      .references(() => chat.id, { onDelete: "cascade" }),
    role: text("role", {
      enum: ["user", "assistant", "system", "tool"],
    }).notNull(),
    content: text("content").notNull(),
    attachments: text("attachments"), // JSON array of file ids
    citations: text("citations"), // JSON array of citation metadata
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({ byChat: index("message_chat_idx").on(t.chatId, t.createdAt) })
);

export const knowledgeFile = sqliteTable("knowledge_file", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  textExtracted: text("text_extracted"),
  chunkCount: integer("chunk_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const knowledgeChunk = sqliteTable(
  "knowledge_chunk",
  {
    id: text("id").primaryKey(),
    fileId: text("file_id")
      .notNull()
      .references(() => knowledgeFile.id, { onDelete: "cascade" }),
    ord: integer("ord").notNull(),
    content: text("content").notNull(),
    tokens: integer("tokens").notNull().default(0),
    embedding: blob("embedding", { mode: "buffer" }).notNull(),
  },
  (t) => ({ byFile: index("chunk_file_idx").on(t.fileId) })
);

export const projectFile = sqliteTable("project_file", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  fileId: text("file_id")
    .notNull()
    .references(() => knowledgeFile.id, { onDelete: "cascade" }),
});

export const integration = sqliteTable("integration", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  status: text("status").notNull().default("disconnected"),
  meta: text("meta"),
});
