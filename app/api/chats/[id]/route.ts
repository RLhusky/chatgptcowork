import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chat = db.select().from(schema.chat).where(eq(schema.chat.id, id)).get();
  if (!chat) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const messages = db
    .select()
    .from(schema.message)
    .where(eq(schema.message.chatId, id))
    .orderBy(asc(schema.message.createdAt))
    .all();
  return NextResponse.json({ chat, messages });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.title === "string") patch.title = body.title.slice(0, 200);
  if (body.projectId === null || typeof body.projectId === "string")
    patch.projectId = body.projectId;
  db.update(schema.chat).set(patch).where(eq(schema.chat.id, id)).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.delete(schema.chat).where(eq(schema.chat.id, id)).run();
  return NextResponse.json({ ok: true });
}
