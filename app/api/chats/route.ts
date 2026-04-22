import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { desc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = db
    .select({
      id: schema.chat.id,
      title: schema.chat.title,
      model: schema.chat.model,
      projectId: schema.chat.projectId,
      updatedAt: schema.chat.updatedAt,
    })
    .from(schema.chat)
    .orderBy(desc(schema.chat.updatedAt))
    .all();
  return NextResponse.json({ chats: rows });
}
