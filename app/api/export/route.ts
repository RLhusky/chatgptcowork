import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const chats = db.select().from(schema.chat).all();
  const messages = db.select().from(schema.message).all();
  const projects = db.select().from(schema.project).all();
  const knowledge = db
    .select({
      id: schema.knowledgeFile.id,
      name: schema.knowledgeFile.name,
      mime: schema.knowledgeFile.mime,
      size: schema.knowledgeFile.size,
      chunkCount: schema.knowledgeFile.chunkCount,
      createdAt: schema.knowledgeFile.createdAt,
    })
    .from(schema.knowledgeFile)
    .all();

  return NextResponse.json(
    {
      exportedAt: new Date().toISOString(),
      chats,
      messages,
      projects,
      knowledge,
    },
    {
      headers: {
        "Content-Disposition": 'attachment; filename="chat-work-export.json"',
      },
    }
  );
}
