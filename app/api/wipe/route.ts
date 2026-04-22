import { NextResponse } from "next/server";
import { sqlite } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  sqlite.exec("BEGIN");
  try {
    sqlite.exec("DELETE FROM message");
    sqlite.exec("DELETE FROM chat");
    sqlite.exec("DELETE FROM project_file");
    sqlite.exec("DELETE FROM project");
    sqlite.exec("DELETE FROM knowledge_chunk");
    sqlite.exec("DELETE FROM knowledge_file");
    sqlite.exec("COMMIT");
  } catch (err) {
    sqlite.exec("ROLLBACK");
    return NextResponse.json(
      { error: "wipe_failed", message: (err as Error).message },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
