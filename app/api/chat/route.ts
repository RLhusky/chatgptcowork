import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { readCodexAuth } from "@/lib/codex-auth";
import { DEFAULT_MODEL_ID, getModel, ReasoningEffort } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PostBody {
  chatId?: string;
  projectId?: string | null;
  model?: string;
  reasoning?: ReasoningEffort;
  webSearch?: boolean;
  knowledgeFileIds?: string[];
  message: string;
  seed?: string;
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body?.message || !body.message.trim()) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

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

  const modelId = body.model ?? DEFAULT_MODEL_ID;
  const modelDef = getModel(modelId);
  const reasoning: ReasoningEffort | null = modelDef.supportsReasoning
    ? (body.reasoning ?? "medium")
    : null;

  let chatId = body.chatId;
  if (!chatId) {
    chatId = randomUUID();
    const title =
      truncate(body.message.replace(/\s+/g, " ").trim(), 60) || "New chat";
    db.insert(schema.chat)
      .values({
        id: chatId,
        title,
        projectId: body.projectId ?? null,
        model: modelId,
        reasoningEffort: reasoning,
      })
      .run();
  } else {
    db.update(schema.chat)
      .set({
        model: modelId,
        reasoningEffort: reasoning,
        updatedAt: new Date(),
        projectId: body.projectId ?? undefined,
      })
      .where(eq(schema.chat.id, chatId))
      .run();
  }

  db.insert(schema.message)
    .values({
      id: randomUUID(),
      chatId,
      role: "user",
      content: body.message,
      attachments: body.knowledgeFileIds?.length
        ? JSON.stringify(body.knowledgeFileIds)
        : null,
      citations: null,
    })
    .run();

  return NextResponse.json({ chatId });
}
