"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, BookOpen, Check, Globe, Plus, X } from "lucide-react";
import { ModelPicker } from "./model-picker";
import { DEFAULT_MODEL_ID, ReasoningEffort } from "@/lib/models";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

export interface KnowledgeFile {
  id: string;
  name: string;
}

export function Composer({
  autoFocus,
  placeholder = "How can I help you today?",
  initialText = "",
  chatId,
  projectId,
  onSendComplete,
  onChatCreated,
  disabled,
}: {
  autoFocus?: boolean;
  placeholder?: string;
  initialText?: string;
  chatId?: string;
  projectId?: string;
  onSendComplete?: () => void;
  onChatCreated?: (chatId: string) => void;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [model, setModel] = useState(DEFAULT_MODEL_ID);
  const [reasoning, setReasoning] = useState<ReasoningEffort>("medium");
  const [webSearch, setWebSearch] = useState(false);
  const [attached, setAttached] = useState<KnowledgeFile[]>([]);
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [sending, setSending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) taRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    fetch("/api/knowledge")
      .then((r) => (r.ok ? r.json() : { files: [] }))
      .then((j) =>
        setKnowledgeFiles(
          (j.files ?? []).map((f: { id: string; name: string }) => ({
            id: f.id,
            name: f.name,
          }))
        )
      )
      .catch(() => setKnowledgeFiles([]));
  }, []);

  function autoGrow() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const max = 8 * 24;
    ta.style.height = Math.min(ta.scrollHeight, max) + "px";
  }

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          projectId,
          model,
          reasoning,
          webSearch,
          knowledgeFileIds: attached.map((a) => a.id),
          message: text.trim(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? `Send failed: ${res.status}`);
        setSending(false);
        return;
      }
      const data = await res.json();
      if (!chatId && data.chatId) {
        onChatCreated?.(data.chatId);
        router.push(`/chat/${data.chatId}`);
        return;
      }
      setText("");
      setAttached([]);
      onSendComplete?.();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function toggleAttach(f: KnowledgeFile) {
    setAttached((cur) =>
      cur.find((x) => x.id === f.id)
        ? cur.filter((x) => x.id !== f.id)
        : [...cur, f]
    );
  }

  return (
    <div className="composer-shadow rounded-2xl bg-white ring-1 ring-[var(--color-border-soft)]">
      <div className="px-5 pt-4">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoGrow();
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled || sending}
          className="w-full resize-none border-0 bg-transparent text-[15px] leading-6 placeholder:text-ink-faint focus-visible:outline-none"
        />
        {attached.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {attached.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-2.5 py-1 text-xs"
              >
                <BookOpen size={12} /> {a.name}
                <button
                  onClick={() => toggleAttach(a)}
                  aria-label="Remove"
                  className="ml-0.5 text-ink-muted hover:text-ink"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-3 pb-3 pt-2">
        <Popover>
          <PopoverTrigger>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-soft)] bg-white text-ink-muted hover:bg-black/[0.03]"
              aria-label="Attach"
            >
              <Plus size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <label className="block cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-black/5">
              Upload file to Knowledge
              <input
                type="file"
                className="hidden"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (!files.length) return;
                  const fd = new FormData();
                  for (const f of files) fd.append("files", f);
                  const r = await fetch("/api/knowledge/upload", {
                    method: "POST",
                    body: fd,
                  });
                  if (r.ok) {
                    const j = await r.json();
                    setKnowledgeFiles((cur) => [...(j.files ?? []), ...cur]);
                  } else {
                    alert("Upload failed");
                  }
                }}
              />
            </label>
          </PopoverContent>
        </Popover>

        <button
          onClick={() => setWebSearch((v) => !v)}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors",
            webSearch
              ? "border-black/20 bg-black/[0.05] text-ink"
              : "border-[var(--color-border-soft)] bg-white text-ink-muted hover:bg-black/[0.03]"
          )}
        >
          <Globe size={14} /> Search
        </button>

        <Popover>
          <PopoverTrigger>
            <button
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors",
                attached.length > 0
                  ? "border-black/20 bg-black/[0.05] text-ink"
                  : "border-[var(--color-border-soft)] bg-white text-ink-muted hover:bg-black/[0.03]"
              )}
            >
              <BookOpen size={14} /> Add knowledge
              {attached.length > 0 && (
                <span className="ml-1 rounded-full bg-black/10 px-1.5 text-[11px]">
                  {attached.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="min-w-[280px]">
            <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Knowledge library
            </div>
            {knowledgeFiles.length === 0 ? (
              <div className="px-3 py-4 text-sm text-ink-muted">
                No files yet. Upload one via{" "}
                <span className="font-medium">Knowledge</span>.
              </div>
            ) : (
              knowledgeFiles.map((f) => {
                const isOn = !!attached.find((x) => x.id === f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleAttach(f)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5"
                  >
                    <Check
                      size={14}
                      className={cn(
                        isOn ? "text-ink" : "text-transparent"
                      )}
                    />
                    <span className="truncate">{f.name}</span>
                  </button>
                );
              })
            )}
          </PopoverContent>
        </Popover>

        <div className="flex-1" />

        <ModelPicker
          value={model}
          reasoning={reasoning}
          onChange={(m, r) => {
            setModel(m);
            setReasoning(r);
          }}
        />

        <button
          onClick={send}
          disabled={!text.trim() || sending || disabled}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-85 disabled:opacity-40"
          aria-label="Send"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
}
