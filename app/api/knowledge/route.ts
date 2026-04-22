import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = db
    .select({
      id: schema.knowledgeFile.id,
      name: schema.knowledgeFile.name,
      mime: schema.knowledgeFile.mime,
      size: schema.knowledgeFile.size,
      chunkCount: schema.knowledgeFile.chunkCount,
      createdAt: schema.knowledgeFile.createdAt,
    })
    .from(schema.knowledgeFile)
    .orderBy(desc(schema.knowledgeFile.createdAt))
    .all();
  return NextResponse.json({ files: rows });
}
