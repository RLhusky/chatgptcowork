import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { getOpenAI, CodexAuthMissingError } from "@/lib/openai";
import { getModel, ReasoningEffort } from "@/lib/models";
import { retrieveChunks } from "@/lib/rag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_BASE =
  "You are Chat Work, a friendly AI coworker powered by OpenAI. Answer clearly and concisely. When the user provides context chunks in a <context> block, cite facts by number in square brackets like [1].";

function truncate(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

async function buildSystemPrompt(
  projectId: string | null,
  retrievedBlock: string
): Promise<string> {
  let projectInstr = "";
  if (projectId) {
    const p = db
      .select({
        instructions: schema.project.instructions,
        name: schema.project.name,
      })
      .from(schema.project)
      .where(eq(schema.project.id, projectId))
      .get();
    if (p?.instructions) {
      projectInstr = `\n\nYou are operating inside the "${p.name}" project. Project instructions:\n${p.instructions}`;
    }
  }
  return SYSTEM_BASE + projectInstr + retrievedBlock;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chatId } = await params;
  let openai;
  try {
    openai = getOpenAI();
  } catch (err) {
    if (err instanceof CodexAuthMissingError) {
      return new Response(
        `event: error\ndata: ${JSON.stringify({ code: "codex_auth_required", message: err.message })}\n\n`,
        {
          status: 401,
          headers: { "Content-Type": "text/event-stream" },
        }
      );
    }
    throw err;
  }

  const chat = db
    .select()
    .from(schema.chat)
    .where(eq(schema.chat.id, chatId))
    .get();
  if (!chat) return new Response("chat_not_found", { status: 404 });

  const modelDef = getModel(chat.model);
  const reasoning = chat.reasoningEffort as ReasoningEffort | null;
  void reasoning;

  // Look up last user message to drive RAG
  const history = db
    .select()
    .from(schema.message)
    .where(eq(schema.message.chatId, chatId))
    .orderBy(asc(schema.message.createdAt))
    .all();

  const lastUser = [...history].reverse().find((m) => m.role === "user");
  let retrievedBlock = "";
  let citations: {
    fileId: string;
    fileName: string;
    ord: number;
    content: string;
  }[] = [];
  if (lastUser?.attachments) {
    try {
      const ids = JSON.parse(lastUser.attachments) as string[];
      if (Array.isArray(ids) && ids.length) {
        const hits = await retrieveChunks(lastUser.content, ids, 6);
        citations = hits.map((h) => ({
          fileId: h.fileId,
          fileName: h.fileName,
          ord: h.ord,
          content: h.content,
        }));
        if (hits.length) {
          retrievedBlock =
            "\n\n<context>\n" +
            hits
              .map(
                (h, i) =>
                  `[${i + 1}] ${h.fileName} (chunk ${h.ord}):\n${truncate(h.content, 1200)}`
              )
              .join("\n\n") +
            "\n</context>";
        }
      }
    } catch {
      // ignore
    }
  }

  const systemPrompt = await buildSystemPrompt(
    chat.projectId ?? null,
    retrievedBlock
  );

  const apiMessages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[] = [
    { role: "system", content: systemPrompt },
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };
      try {
        send("meta", { chatId, citations, model: modelDef.id });
        const completion = await openai.chat.completions.create({
          model: modelDef.id,
          messages: apiMessages,
          stream: true,
        });
        let full = "";
        for await (const part of completion) {
          const delta = part.choices[0]?.delta?.content ?? "";
          if (delta) {
            full += delta;
            send("token", { delta });
          }
        }
        const msgId = randomUUID();
        db.insert(schema.message)
          .values({
            id: msgId,
            chatId,
            role: "assistant",
            content: full,
            citations: citations.length ? JSON.stringify(citations) : null,
          })
          .run();
        db.update(schema.chat)
          .set({ updatedAt: new Date() })
          .where(eq(schema.chat.id, chatId))
          .run();
        send("done", { messageId: msgId });
      } catch (err) {
        send("error", { message: (err as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
