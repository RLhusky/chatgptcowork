import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { ChatView, InitialMessage } from "./chat-view";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chat = db.select().from(schema.chat).where(eq(schema.chat.id, id)).get();
  if (!chat) notFound();

  const messageRows = db
    .select()
    .from(schema.message)
    .where(eq(schema.message.chatId, id))
    .orderBy(asc(schema.message.createdAt))
    .all();

  const initial: InitialMessage[] = messageRows.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system" | "tool",
    content: m.content,
    citations: m.citations ? JSON.parse(m.citations) : [],
  }));

  // Auto-trigger streaming if the last message is a user message without a reply
  const last = initial[initial.length - 1];
  const needsCompletion = last?.role === "user";

  return (
    <ChatView
      chat={{
        id: chat.id,
        title: chat.title,
        projectId: chat.projectId,
        model: chat.model,
      }}
      initialMessages={initial}
      autoStream={needsCompletion}
    />
  );
}
