import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const f = db
    .select()
    .from(schema.knowledgeFile)
    .where(eq(schema.knowledgeFile.id, id))
    .get();
  if (!f) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ file: f });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.delete(schema.knowledgeFile)
    .where(eq(schema.knowledgeFile.id, id))
    .run();
  return NextResponse.json({ ok: true });
}
