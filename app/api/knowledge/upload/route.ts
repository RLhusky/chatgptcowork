import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { extractText } from "@/lib/parsers";
import { chunkText } from "@/lib/chunker";
import { embedTexts, embeddingToBuffer } from "@/lib/rag";
import { readCodexAuth } from "@/lib/codex-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!readCodexAuth()) {
    return NextResponse.json(
      {
        error: "codex_auth_required",
        message:
          "No Codex credentials found. Run `codex login` (install with `npm i -g @openai/codex`) or set OPENAI_API_KEY.",
      },
      { status: 401 }
    );
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((v) => v instanceof File) as File[];
  if (files.length === 0) {
    return NextResponse.json({ error: "no_files" }, { status: 400 });
  }

  const created: { id: string; name: string; chunkCount: number }[] = [];

  for (const f of files) {
    const buf = Buffer.from(await f.arrayBuffer());
    let text = "";
    try {
      text = await extractText(buf, f.type, f.name);
    } catch (err) {
      console.error("[parse]", f.name, err);
      continue;
    }
    if (!text.trim()) continue;

    const id = randomUUID();
    db.insert(schema.knowledgeFile)
      .values({
        id,
        name: f.name,
        mime: f.type || "text/plain",
        size: f.size,
        textExtracted: text.slice(0, 200_000),
        chunkCount: 0,
      })
      .run();

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      created.push({ id, name: f.name, chunkCount: 0 });
      continue;
    }

    // Embed in batches to avoid huge payloads
    const BATCH = 64;
    const allVecs: number[][] = [];
    for (let i = 0; i < chunks.length; i += BATCH) {
      const slice = chunks.slice(i, i + BATCH).map((c) => c.content);
      const vecs = await embedTexts(slice);
      allVecs.push(...vecs);
    }

    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const vec = allVecs[i];
      if (!vec) continue;
      db.insert(schema.knowledgeChunk)
        .values({
          id: randomUUID(),
          fileId: id,
          ord: c.ord,
          content: c.content,
          tokens: c.tokens,
          embedding: embeddingToBuffer(vec),
        })
        .run();
    }
    db.update(schema.knowledgeFile)
      .set({ chunkCount: chunks.length })
      .where(eq(schema.knowledgeFile.id, id))
      .run();
    created.push({ id, name: f.name, chunkCount: chunks.length });
  }

  return NextResponse.json({ files: created });
}
