"use client";

import { useEffect, useRef, useState } from "react";
import { Composer } from "@/components/composer";
import { Citation, Message } from "@/components/message";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export interface InitialMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  citations: Citation[];
}

interface ChatMeta {
  id: string;
  title: string;
  projectId: string | null;
  model: string;
}

export function ChatView({
  chat,
  initialMessages,
  autoStream,
}: {
  chat: ChatMeta;
  initialMessages: InitialMessage[];
  autoStream?: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<InitialMessage[]>(initialMessages);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [streamingCitations, setStreamingCitations] = useState<Citation[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [inspected, setInspected] = useState<Citation | null>(null);
  const [title, setTitle] = useState(chat.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const kicked = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamingText]);

  useEffect(() => {
    if (autoStream && !kicked.current) {
      kicked.current = true;
      startStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStream]);

  async function startStream() {
    setStreaming(true);
    setStreamingText("");
    setStreamingCitations([]);
    try {
      const res = await fetch(`/api/chat/${chat.id}/stream`, { method: "POST" });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        alert(body?.message ?? `Stream failed: ${res.status}`);
        setStreaming(false);
        setStreamingText(null);
        return;
      }
      await readEventStream(res.body);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setStreaming(false);
    }
  }

  async function readEventStream(body: ReadableStream<Uint8Array>) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let accumulated = "";
    let citations: Citation[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const events = buf.split("\n\n");
      buf = events.pop() ?? "";
      for (const e of events) {
        const lines = e.split("\n");
        let eventName = "message";
        let dataLine = "";
        for (const ln of lines) {
          if (ln.startsWith("event:")) eventName = ln.slice(6).trim();
          else if (ln.startsWith("data:")) dataLine += ln.slice(5).trim();
        }
        if (!dataLine) continue;
        let data: unknown;
        try {
          data = JSON.parse(dataLine);
        } catch {
          continue;
        }
        if (eventName === "meta") {
          const d = data as { citations: Citation[] };
          citations = d.citations ?? [];
          setStreamingCitations(citations);
        } else if (eventName === "token") {
          const d = data as { delta: string };
          accumulated += d.delta;
          setStreamingText(accumulated);
        } else if (eventName === "done") {
          setMessages((cur) => [
            ...cur,
            {
              id: (data as { messageId: string }).messageId,
              role: "assistant",
              content: accumulated,
              citations,
            },
          ]);
          setStreamingText(null);
          router.refresh();
        } else if (eventName === "error") {
          const d = data as { message: string };
          alert(d.message);
          setStreamingText(null);
        }
      }
    }
  }

  async function saveTitle() {
    setEditingTitle(false);
    if (title === chat.title) return;
    await fetch(`/api/chats/${chat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    router.refresh();
  }

  async function handleSendComplete() {
    const res = await fetch(`/api/chats/${chat.id}`);
    if (res.ok) {
      const j = await res.json();
      setMessages(
        (j.messages as InitialMessage[]).map((m) => ({
          ...m,
          citations: typeof m.citations === "string"
            ? JSON.parse(m.citations)
            : (m.citations ?? []),
        }))
      );
    }
    startStream();
  }

  return (
    <div className="canvas-gradient flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-black/5 bg-white/50 px-6 py-3 backdrop-blur">
        {editingTitle ? (
          <input
            className="flex-1 rounded-md bg-white px-2 py-1 text-[15px] font-medium ring-1 ring-black/10 focus:outline-none"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") {
                setTitle(chat.title);
                setEditingTitle(false);
              }
            }}
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex-1 truncate text-left text-[15px] font-medium hover:bg-black/5 rounded-md px-2 py-1"
          >
            {title}
          </button>
        )}
        <button
          onClick={async () => {
            if (!confirm("Delete this chat?")) return;
            await fetch(`/api/chats/${chat.id}`, { method: "DELETE" });
            router.push("/chats");
          }}
          className="rounded-md px-2 py-1 text-sm text-ink-muted hover:bg-black/5"
        >
          Delete
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 pb-40 pt-6"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((m) => (
              <Message
                key={m.id}
                role={m.role}
                content={m.content}
                citations={m.citations}
                onCitationClick={(c) => setInspected(c)}
              />
            ))}
            {streamingText !== null && (
              <Message
                role="assistant"
                content={streamingText}
                streaming
                citations={streamingCitations}
                onCitationClick={(c) => setInspected(c)}
              />
            )}
          </div>
        </div>
        {inspected && (
          <aside className="w-[360px] shrink-0 border-l border-black/5 bg-white/80 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold">{inspected.fileName}</div>
              <button
                className="rounded-md p-1 hover:bg-black/5"
                onClick={() => setInspected(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="text-xs text-ink-muted mb-2">
              chunk {inspected.ord}
            </div>
            <div className="whitespace-pre-wrap rounded-lg bg-black/[0.04] p-3 text-[13px] leading-5">
              {inspected.content}
            </div>
          </aside>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-6">
        <div className="pointer-events-auto mx-auto max-w-3xl">
          <Composer
            chatId={chat.id}
            projectId={chat.projectId ?? undefined}
            onSendComplete={handleSendComplete}
            onChatCreated={() => {}}
            disabled={streaming}
          />
        </div>
      </div>
    </div>
  );
}
