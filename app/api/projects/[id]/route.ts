import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const p = db.select().from(schema.project).where(eq(schema.project.id, id)).get();
  if (!p) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const files = db
    .select({
      id: schema.knowledgeFile.id,
      name: schema.knowledgeFile.name,
      mime: schema.knowledgeFile.mime,
      chunkCount: schema.knowledgeFile.chunkCount,
    })
    .from(schema.projectFile)
    .innerJoin(
      schema.knowledgeFile,
      eq(schema.knowledgeFile.id, schema.projectFile.fileId)
    )
    .where(eq(schema.projectFile.projectId, id))
    .all();
  const chats = db
    .select({
      id: schema.chat.id,
      title: schema.chat.title,
      updatedAt: schema.chat.updatedAt,
    })
    .from(schema.chat)
    .where(eq(schema.chat.projectId, id))
    .all();
  return NextResponse.json({ project: p, files, chats });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.name === "string") patch.name = body.name.slice(0, 200);
  if (typeof body.instructions === "string")
    patch.instructions = body.instructions.slice(0, 20000);
  if (typeof body.icon === "string") patch.icon = body.icon;
  db.update(schema.project).set(patch).where(eq(schema.project.id, id)).run();

  if (Array.isArray(body.fileIds)) {
    db.delete(schema.projectFile)
      .where(eq(schema.projectFile.projectId, id))
      .run();
    for (const fid of body.fileIds as string[]) {
      db.insert(schema.projectFile)
        .values({ id: randomUUID(), projectId: id, fileId: fid })
        .run();
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.delete(schema.project).where(eq(schema.project.id, id)).run();
  return NextResponse.json({ ok: true });
}
