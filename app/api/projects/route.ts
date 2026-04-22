import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = db
    .select()
    .from(schema.project)
    .orderBy(desc(schema.project.updatedAt))
    .all();
  return NextResponse.json({ projects: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  const id = randomUUID();
  db.insert(schema.project)
    .values({
      id,
      name: body.name.slice(0, 200),
      instructions: body.instructions?.slice(0, 20000) ?? "",
      icon: body.icon ?? "folder",
    })
    .run();
  return NextResponse.json({ id });
}
